// RFIN Assistant (Phase 3). Answers from the customer's own RFIN data with
// guardrails: explains, never advises or promises returns, and hands off to a
// human for decisions. Uses Claude when credentials are configured; otherwise a
// rule-based reply built from the same context, so the feature always works.
const Anthropic = require("@anthropic-ai/sdk").default;
const { financialLife, recommendations, inr } = require("./insights");
const db = require("../../models");

const MODEL = process.env.RFIN_ASSISTANT_MODEL || "claude-opus-5";
const EFFORT = process.env.RFIN_ASSISTANT_EFFORT || "medium"; // chat: tune per measured quality
const MAX_HISTORY = 12;

// Screens the assistant may point to — anything else is dropped.
const ROUTES = ["/home", "/explore", "/markets", "/portfolio", "/life", "/goals", "/kyc", "/bank", "/activity", "/documents", "/rewards", "/refer", "/support", "/profile/financial", "/family", "/notifications/preferences"];
const ROUTE_PREFIXES = ["/product/", "/company/", "/order/", "/goals/", "/eligibility/", "/rewards/benefit/", "/kyc/upload/"];
const allowedRoute = (r) => typeof r === "string" && (ROUTES.includes(r) || ROUTE_PREFIXES.some((p) => r.startsWith(p) && /^[\w\-/]+$/.test(r)));

// Frozen system prompt — kept byte-stable so it caches across every customer
// (per-customer context goes in a separate block after the cache breakpoint).
const SYSTEM = `You are the RFIN Assistant inside the RFIN app, an Indian financial platform for insurance, loans, investments and unlisted (private-market) shares.

How you help:
- Answer questions about the customer's own RFIN data (given in the context block), how RFIN works, and financial concepts.
- Keep replies short: 2–5 sentences, plain words, amounts in rupees with Indian digit grouping (₹1,75,000).
- When a screen in the app would help, suggest up to 3 actions using only routes from the allowed list in the context block.

Guardrails — always follow:
- You explain; you do not give personalised investment, tax or legal advice, and you never tell the customer to buy or sell a specific product.
- Never promise or imply guaranteed returns. Private-market prices are indicative, not quotes — say so when you mention one.
- Only use facts from the context block. If something isn't there, say you can't see it and suggest the relevant screen.
- For decisions, complaints or anything account-changing, suggest talking to a human advisor (route /support).
- Rewards never change a product's risk; don't use them to encourage a financial decision.`;

const SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, route: { type: "string" } },
        required: ["label", "route"],
        additionalProperties: false,
      },
    },
  },
  required: ["reply", "actions"],
  additionalProperties: false,
};

async function contextFor(customer) {
  const [life, recs, kyc, orders] = await Promise.all([
    financialLife(customer),
    recommendations(customer),
    db.rfinKycItem.findAll({ where: { customer_id: customer.id } }),
    db.rfinOrder.findAll({ where: { customer_id: customer.id }, order: [["createdAt", "DESC"]], limit: 5 }),
  ]);
  return { customer, life, recs, kyc, orders };
}

function contextText({ customer, life, recs, kyc, orders }) {
  const lines = [
    `Customer: ${customer.name || "not set"} · roles ${customer.roles.join(", ")} · goals ${(customer.needs || []).join(", ") || "none"}`,
    `Financial profile: ${JSON.stringify(customer.financial || {})}`,
    `KYC: ${kyc.map((k) => `${k.label}=${k.state}`).join(", ")}`,
    `Net worth (indicative): ${inr(life.netWorth)} · investments ${inr(life.totals.investments)} (unlisted ${inr(life.totals.unlisted)}) · cover ${inr(life.totals.cover)} · loans ${inr(life.totals.loans)}`,
    `Unlisted holdings: ${life.holdings.map((h) => `${h.name} ${h.quantity} sh, avg ${inr(h.avgCost)}, indicative ${inr(h.indicativePrice)}`).join("; ") || "none"}`,
    `Goals: ${life.goals.map((g) => `${g.title} ${g.pct}% of ${inr(g.target)} by ${g.targetDate}${g.onTrack ? "" : `, behind (needs ${inr(g.monthlyNeeded)}/month)`}`).join("; ") || "none"}`,
    `Recent orders: ${orders.map((o) => `${o.id} ${o.title} ${o.state}`).join("; ") || "none"}`,
    `Insights: ${life.insights.map((i) => i.title).join("; ") || "none"}`,
    `Open alerts: ${recs.alerts.map((a) => `${a.title} (${a.route})`).join("; ") || "none"}`,
    `Suggestions on file: ${recs.forYou.slice(0, 4).map((r) => `${r.title} (${r.route})`).join("; ")}`,
    `Allowed routes: ${ROUTES.join(", ")}, or ${ROUTE_PREFIXES.map((p) => p + "<id>").join(", ")}`,
  ];
  return lines.join("\n");
}

/** Deterministic fallback — same data, keyword intents. */
function ruleReply(message, ctx) {
  const m = message.toLowerCase();
  const { life, recs, kyc } = ctx;
  const pending = kyc.filter((k) => k.state !== "verified");
  if (/kyc|verify|document|pan|address/.test(m)) {
    return pending.length
      ? { reply: `You have ${pending.length} KYC check${pending.length > 1 ? "s" : ""} left: ${pending.map((k) => k.label).join(", ")}. Each one says why it's needed, and you only do them once.`, actions: [{ label: "Open KYC", route: "/kyc" }] }
      : { reply: "Your KYC is fully verified — you won't be asked again unless something expires.", actions: [] };
  }
  if (/portfolio|worth|holding|invest|share/.test(m)) {
    return {
      reply: `Your indicative net worth on RFIN is ${inr(life.netWorth)}, with ${inr(life.totals.unlisted)} in unlisted shares. Unlisted values are indicative, not quotes.${life.insights[0] ? ` One thing to note: ${life.insights[0].title.toLowerCase()}.` : ""}`,
      actions: [{ label: "My financial life", route: "/life" }, { label: "Portfolio", route: "/portfolio" }],
    };
  }
  if (/goal|save|plan|target/.test(m)) {
    const goals = life.goals.filter((g) => g.state !== "archived");
    if (!goals.length) return { reply: "You haven't set a goal yet. Pick a target and a date, and RFIN shows the monthly amount it takes.", actions: [{ label: "Set a goal", route: "/goals" }] };
    const behind = goals.filter((g) => !g.onTrack);
    const summary = goals.map((g) => `${g.title} is ${g.pct}% of ${inr(g.target)}`).join("; ");
    return {
      reply: `You have ${goals.length} goal${goals.length > 1 ? "s" : ""}: ${summary}. ${behind.length ? `${behind[0].title} is behind — about ${inr(behind[0].monthlyNeeded)} a month would get it back on track by ${behind[0].targetDate}.` : "All of them are on track."}`,
      actions: [...(behind[0] ? [{ label: `Open ${behind[0].title}`.slice(0, 40), route: `/goals/${behind[0].id}` }] : []), { label: "All goals", route: "/goals" }],
    };
  }
  if (/loan|borrow|emi|credit/.test(m)) return { reply: "You can check indicative loan eligibility with two numbers — it doesn't affect your credit score. The lender confirms the final rate.", actions: [{ label: "Check eligibility", route: "/eligibility/personal-loan" }] };
  if (/insur|cover|term|health|family/.test(m)) return { reply: `Your recorded cover is ${inr(life.totals.cover)}. Product pages show what's covered, the exclusions and the premium before you decide.`, actions: [{ label: "Term cover", route: "/product/term-shield" }, { label: "Family", route: "/family" }] };
  if (/point|reward|gift|draw|refer/.test(m)) return { reply: "Points unlock with eligible transactions and are never cash. Gift cards and draw progress are in Rewards.", actions: [{ label: "Rewards", route: "/rewards" }] };
  if (/sell|exit|liquid/.test(m)) return { reply: "Selling unlisted shares means verifying your holding, checking price evidence, listing, then approvals (including ROFR) before transfer. It can take days to weeks.", actions: [{ label: "Portfolio", route: "/portfolio" }] };
  const top = recs.alerts[0] || recs.forYou[0];
  return {
    reply: `I can help with your KYC, applications, portfolio, goals, loans, insurance and rewards.${top ? ` Right now, the most useful next step looks like: ${top.title.toLowerCase()}.` : ""} For decisions, an advisor can talk it through with you.`,
    actions: [...(top ? [{ label: top.title.slice(0, 40), route: top.route }] : []), { label: "Talk to a human", route: "/support" }],
  };
}

let client = null;
const hasCredentials = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

async function claudeReply(message, history, ctx) {
  if (!client) client = new Anthropic();
  const messages = [...history.slice(-MAX_HISTORY).map((h) => ({ role: h.role, content: String(h.text).slice(0, 2000) })), { role: "user", content: message }];
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: `Customer context (live, from RFIN):\n${contextText(ctx)}` },
    ],
    messages,
    output_config: { effort: EFFORT, format: { type: "json_schema", schema: SCHEMA } },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  if (response.stop_reason === "refusal") return null;
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const parsed = JSON.parse(text);
  return { reply: parsed.reply, actions: parsed.actions };
}

/** Reply to one turn. `history` is [{ role: "user"|"assistant", text }]. */
async function reply(customer, message, history = []) {
  const ctx = await contextFor(customer);
  let out = null;
  let source = "rules";
  if (hasCredentials()) {
    try {
      out = await claudeReply(message, history, ctx);
      if (out) source = "claude";
    } catch (e) {
      if (e instanceof Anthropic.APIError) console.error(`[assistant] Claude API ${e.status}: ${e.message}`);
      else console.error("[assistant]", e.message);
    }
  }
  if (!out) out = ruleReply(message, ctx);
  return {
    reply: out.reply,
    actions: (out.actions || []).filter((a) => allowedRoute(a.route)).slice(0, 3),
    source,
    disclaimer: "The RFIN Assistant explains; it doesn't give investment advice. Prices shown are indicative.",
  };
}

module.exports = { reply };
