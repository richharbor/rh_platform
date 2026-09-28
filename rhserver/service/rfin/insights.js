// Customer 360 read models (report #15–#18, #22, #28, #30, #45, #94) and the
// rule-based next-best-action engine. Every recommendation carries the reasons
// it was made — never a guarantee.
const db = require("../../models");
const serialize = require("./serialize");
const { notify } = require("./notify");
const { tierFor } = require("../../constants/rfin");

const inr = (paise) => `₹${Math.round(Number(paise) / 100).toLocaleString("en-IN")}`;
const DAY = 86400000;

// Cover implied by the product name ("Term Shield 1 Cr", "₹10 L cover").
const coverFrom = (p) => {
  const m = `${p.name} ${p.tagline}`.match(/(\d+(?:\.\d+)?)\s*(Cr|L)\b/i);
  if (!m) return 0;
  return Math.round(Number(m[1]) * (m[2].toLowerCase() === "cr" ? 1e7 : 1e5) * 100);
};

function goalProgress(g) {
  const saved = (g.contributions || []).reduce((s, c) => s + Number(c.amount), 0);
  const target = Number(g.target);
  const start = new Date(g.createdAt).getTime();
  const end = new Date(g.target_date).getTime();
  const now = Date.now();
  const months = Math.max(1, Math.ceil((end - now) / (30 * DAY)));
  const expected = end > start ? target * Math.min(1, Math.max(0, (now - start) / (end - start))) : target;
  const pct = target ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const onTrack = saved >= expected * 0.9;
  return {
    id: g.id,
    need: g.need,
    title: g.title,
    target,
    targetDate: g.target_date,
    saved,
    pct,
    state: saved >= target ? "achieved" : g.state,
    onTrack: saved >= target || onTrack,
    monthlyNeeded: saved >= target ? 0 : Math.ceil((target - saved) / months),
    monthsLeft: months,
    contributions: g.contributions,
  };
}

async function portfolioFor(customerId) {
  const rows = await db.rfinHolding.findAll({ where: { customer_id: customerId }, include: [{ model: db.rfinCompany, as: "company" }] });
  return rows.filter((h) => h.quantity > 0).map(serialize.holding);
}

/** "My financial life" (report #45): everything RFIN knows, in one place. */
async function financialLife(customer) {
  const cid = customer.id;
  const [orders, products, external, goals, family, holdings] = await Promise.all([
    db.rfinOrder.findAll({ where: { customer_id: cid, state: "fulfilled" } }),
    db.rfinProduct.findAll(),
    db.rfinExistingProduct.findAll({ where: { customer_id: cid }, order: [["createdAt", "ASC"]] }),
    db.rfinGoal.findAll({ where: { customer_id: cid }, order: [["target_date", "ASC"]] }),
    db.rfinFamilyMember.findAll({ where: { customer_id: cid } }),
    portfolioFor(cid),
  ]);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const onRfin = orders
    .filter((o) => o.kind !== "pm_buy")
    .map((o) => {
      const p = byId[o.subject_id];
      const kind = p ? { insurance: "insurance", loans: "loan", investments: "investment" }[p.category] : "investment";
      return { id: o.id, source: "rfin", kind, name: o.title, provider: p ? p.provider : "RFIN", value: kind === "insurance" && p ? coverFrom(p) : Number(o.amount), at: o.createdAt.toISOString() };
    });
  const ext = external.map((e) => ({ id: `EX-${e.id}`, externalId: e.id, source: "external", kind: e.kind, name: e.name, provider: e.provider || undefined, value: Number(e.value), at: e.createdAt.toISOString() }));
  const all = [...onRfin, ...ext];
  const sum = (kind) => all.filter((x) => x.kind === kind).reduce((s, x) => s + x.value, 0);
  const unlisted = holdings.reduce((s, h) => s + h.indicativeValue, 0);
  const investments = sum("investment") + unlisted;
  const loans = sum("loan");
  const cover = sum("insurance");

  // Portfolio intelligence (Phase 3): concentration, liquidity, protection gaps.
  const insights = [];
  if (investments && unlisted / investments > 0.5) insights.push({ tone: "action", title: `${Math.round((unlisted / investments) * 100)}% of investments are unlisted`, detail: "Unlisted shares can take weeks to sell. Keep enough in liquid assets for emergencies." });
  const bySector = {};
  for (const h of holdings) bySector[h.sector] = (bySector[h.sector] || 0) + h.indicativeValue;
  const top = Object.entries(bySector).sort((a, b) => b[1] - a[1])[0];
  if (top && unlisted && top[1] / unlisted > 0.6) insights.push({ tone: "pending", title: `${Math.round((top[1] / unlisted) * 100)}% of private holdings in ${top[0]}`, detail: "One sector dominates. Consider how concentrated you want to be." });
  const dependants = family.filter((f) => f.dependent).length;
  if (dependants && !cover) insights.push({ tone: "action", title: `${dependants} dependant${dependants > 1 ? "s" : ""}, no life or health cover on record`, detail: "Add cover you hold elsewhere, or compare term and family health plans." });
  const offTrack = goals.map(goalProgress).filter((g) => g.state === "active" && !g.onTrack);
  if (offTrack.length) insights.push({ tone: "pending", title: `${offTrack.length} goal${offTrack.length > 1 ? "s" : ""} behind schedule`, detail: `${offTrack[0].title} needs ${inr(offTrack[0].monthlyNeeded)} a month to catch up.` });

  return {
    netWorth: investments - loans,
    totals: { investments, unlisted, cover, loans },
    items: all,
    holdings,
    goals: goals.map(goalProgress),
    family: family.map((f) => ({ id: f.id, name: f.name, relation: f.relation, birthYear: f.birth_year || undefined, dependent: f.dependent, cover: f.cover })),
    insights,
    note: "Unlisted values are indicative. External products are as you entered them.",
  };
}

/**
 * Next-best actions (report #22, #28, #30; Phase 3 proactive alerts). Returns
 * `alerts` (time-sensitive, shown first) and `forYou` (suggestions), each with
 * the reasons behind it.
 */
async function recommendations(customer) {
  const cid = customer.id;
  const [kyc, orders, benefits, points, family, goals, holdings, referrals, external] = await Promise.all([
    db.rfinKycItem.findAll({ where: { customer_id: cid } }),
    db.rfinOrder.findAll({ where: { customer_id: cid } }),
    db.rfinBenefit.findAll({ where: { customer_id: cid } }),
    db.rfinPointEntry.findAll({ where: { customer_id: cid } }),
    db.rfinFamilyMember.findAll({ where: { customer_id: cid } }),
    db.rfinGoal.findAll({ where: { customer_id: cid, state: "active" } }),
    portfolioFor(cid),
    db.rfinReferral.count({ where: { referrer_id: cid } }),
    db.rfinExistingProduct.findAll({ where: { customer_id: cid } }),
  ]);
  const fin = customer.financial || {};
  const needs = customer.needs || [];
  const alerts = [];
  const forYou = [];

  const due = orders.find((o) => o.state === "action_required" && o.action);
  if (due) alerts.push({ id: `a-order-${due.id}`, title: due.action.label, detail: `${due.title} · ${due.action.reason}`, route: `/order/${due.id}`, reasons: ["An application is waiting on you"] });
  const kycBlock = kyc.find((k) => k.state === "action_required");
  if (kycBlock) alerts.push({ id: `a-kyc-${kycBlock.item_key}`, title: `Fix your ${kycBlock.label.toLowerCase()}`, detail: kycBlock.rejection_reason || kycBlock.why, route: `/kyc/upload/${kycBlock.item_key}`, reasons: ["KYC blocks new applications"] });
  for (const b of benefits) {
    if (b.state === "ready" && b.expires_at && new Date(b.expires_at) - Date.now() < 14 * DAY) {
      alerts.push({ id: `a-benefit-${b.id}`, title: `${inr(b.value)} ${b.title.toLowerCase()} expires soon`, detail: `Use it before ${new Date(b.expires_at).toDateString().slice(4)}.`, route: `/rewards/benefit/${b.id}`, reasons: ["Unused benefit close to expiry"] });
    }
  }
  for (const g of goals.map(goalProgress)) {
    if (!g.onTrack) alerts.push({ id: `a-goal-${g.id}`, title: `${g.title} is behind`, detail: `${inr(g.monthlyNeeded)}/month keeps it on track for ${g.targetDate}.`, route: `/goals/${g.id}`, reasons: ["Contributions below the pace your target date needs"] });
  }

  const hasCover = (cat) => orders.some((o) => o.state === "fulfilled" && ["term-shield", "family-health"].includes(o.subject_id) && (cat === "life" ? o.subject_id === "term-shield" : o.subject_id === "family-health")) || external.some((e) => e.kind === "insurance" && new RegExp(cat === "life" ? "term|life" : "health|medi", "i").test(e.name));
  const dependants = family.filter((f) => f.dependent);
  if ((needs.includes("protect_family") || dependants.length) && !hasCover("life")) {
    forYou.push({ id: "r-term", title: "Term cover · ₹1 crore", detail: "From ₹1,050/month. Compare cover and exclusions first.", route: "/product/term-shield", kind: "product", reasons: [needs.includes("protect_family") ? "Your goal: protect family" : null, dependants.length ? `${dependants.length} dependant${dependants.length > 1 ? "s" : ""} in your family profile` : null, "No life cover on record"].filter(Boolean) });
  }
  if (dependants.length && !hasCover("health")) {
    forYou.push({ id: "r-health", title: "Family health cover · ₹10 L", detail: "One floater for up to 6 members.", route: "/product/family-health", kind: "product", reasons: [`${dependants.map((d) => d.name).join(", ")} not covered for health`] });
  }
  if (needs.includes("need_funding")) forYou.push({ id: "r-loan", title: "Check your loan eligibility", detail: "Two numbers, an indicative answer, no credit-score impact.", route: "/eligibility/personal-loan", kind: "product", reasons: ["Your goal: need funding"] });
  if (needs.includes("grow_wealth") || needs.includes("find_opportunity")) {
    const risky = fin.risk === "high" || fin.risk === "moderate";
    forYou.push(
      risky
        ? { id: "r-pm", title: "PhonePe · new pre-IPO supply", detail: "Indicative ₹1,480/share. Transfer restrictions apply.", route: "/company/phonepe", kind: "company", reasons: ["Your goal: grow wealth", `Risk preference: ${fin.risk}`, "New supply available"] }
        : { id: "r-bonds", title: "AA Corporate Bond Basket", detail: "Indicative 9.2% yield. Not guaranteed.", route: "/product/corp-bond-aa", kind: "product", reasons: ["Your goal: grow wealth", fin.risk ? `Risk preference: ${fin.risk}` : "Set your risk preference for better matches"] },
    );
  }
  if (needs.includes("invest_surplus") && Number(fin.investible) > 0) forYou.push({ id: "r-surplus", title: "Put idle surplus to work", detail: `You told us ${inr(fin.investible)} is investible. Bonds start at ₹10,000.`, route: "/product/corp-bond-aa", kind: "product", reasons: ["Your goal: invest surplus", "Investible amount in your financial profile"] });
  if (needs.includes("sell_asset") && holdings.length) forYou.push({ id: "r-sell", title: `Buyers are watching ${holdings[0].name}`, detail: "See price evidence before you list.", route: `/sell/new?company=${holdings[0].companyId}`, kind: "company", reasons: ["Your goal: sell an asset", `You hold ${holdings[0].quantity} shares`] });
  if (!goals.length) forYou.push({ id: "r-goal", title: "Turn a goal into a plan", detail: "Set a target and date — we'll show the monthly amount.", route: "/goals", kind: "action", reasons: ["No goals set yet"] });
  if (!fin.risk) forYou.push({ id: "r-profile", title: "Complete your financial profile", detail: "Income band, risk and horizon make recommendations sharper.", route: "/profile/financial", kind: "action", reasons: ["Financial profile incomplete"] });
  if (!referrals) forYou.push({ id: "r-refer", title: "Refer a friend, earn ₹250", detail: "Paid when they complete their first transaction.", route: "/refer", kind: "action", reasons: ["You haven't referred anyone yet"] });
  const lifetime = points.reduce((s, p) => s + p.points, 0);
  const { next } = tierFor(lifetime);
  if (next && next.minPoints - lifetime <= 1000) forYou.push({ id: "r-tier", title: `${next.minPoints - lifetime} points to ${next.name}`, detail: next.perks[0], route: "/rewards", kind: "action", reasons: ["Close to the next tier"] });

  return { alerts, forYou, note: "Suggestions are based on what you've told us and your activity on RFIN. They aren't advice or a guarantee." };
}

/** Private-market alerts, evaluated against indicative prices; each fires once. */
async function evaluateAlerts(customerId) {
  const rows = await db.rfinAlert.findAll({ where: { customer_id: customerId }, order: [["createdAt", "DESC"]] });
  const companies = Object.fromEntries((await db.rfinCompany.findAll()).map((c) => [c.id, c]));
  for (const a of rows) {
    const c = companies[a.company_id];
    if (!a.active || !c) continue;
    const price = serialize.indicativePrice(c);
    const hit =
      (a.kind === "price_above" && price >= Number(a.threshold)) ||
      (a.kind === "price_below" && price <= Number(a.threshold)) ||
      (a.kind === "new_supply" && c.is_new_supply && c.available);
    if (!hit) continue;
    const [updated] = await db.rfinAlert.update({ active: false, triggered_at: new Date() }, { where: { id: a.id, active: true } });
    if (!updated) continue; // someone else fired it first
    a.active = false;
    a.triggered_at = new Date();
    await notify(customerId, { category: "product_updates", tone: "info", title: `${c.name}: ${a.kind === "new_supply" ? "new supply available" : `indicative price ${inr(price)}`}`, body: a.kind === "new_supply" ? "Shares are available to buy now." : `Your ${a.kind === "price_above" ? "above" : "below"} ${inr(a.threshold)} alert fired.`, route: `/company/${c.id}` });
  }
  return rows.map((a) => ({ id: a.id, companyId: a.company_id, companyName: companies[a.company_id] ? companies[a.company_id].name : a.company_id, kind: a.kind, threshold: a.threshold == null ? undefined : Number(a.threshold), active: a.active, triggeredAt: a.triggered_at ? new Date(a.triggered_at).toISOString() : undefined }));
}

module.exports = { financialLife, recommendations, goalProgress, evaluateAlerts, inr };
