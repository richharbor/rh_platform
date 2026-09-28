const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const insights = require("../../service/rfin/insights");
const assistant = require("../../service/rfin/assistant");
const { FAQS } = require("../../service/rfin/support");
const { PARTNER } = require("../../constants/rfin");
const INSIGHTS = require("../../shared/rfin/src/insights.json");

const NEEDS = ["grow_wealth", "protect_family", "need_funding", "invest_surplus", "sell_asset", "save_plan", "find_opportunity"];
const FIN = {
  incomeBand: ["Under ₹5 L", "₹5–15 L", "₹15–50 L", "₹50 L+"],
  risk: ["low", "moderate", "high"],
  horizon: ["Under 1 year", "1–3 years", "3–7 years", "7+ years"],
  liquidity: ["low", "medium", "high"],
};

// ── Financial profile (report #15) ──────────────────────────────────────
const getFinancial = asyncWrapper(async (req, res) => res.json({ ...req.customer.financial, options: FIN }));

const updateFinancial = asyncWrapper(async (req, res) => {
  const next = { ...req.customer.financial };
  for (const [k, allowed] of Object.entries(FIN)) {
    if (req.body[k] === undefined) continue;
    if (!allowed.includes(req.body[k])) return res.status(400).json({ error: `Pick a valid ${k}` });
    next[k] = req.body[k];
  }
  if (req.body.investible !== undefined) {
    const v = Math.round(Number(req.body.investible));
    if (!(v >= 0)) return res.status(400).json({ error: "Investible amount can't be negative" });
    next.investible = v;
  }
  req.customer.financial = next;
  req.customer.changed("financial", true);
  await req.customer.save();
  res.json({ ...next, options: FIN });
});

// ── Existing products held elsewhere (report #16) ───────────────────────
const out = (e) => ({ id: e.id, kind: e.kind, name: e.name, provider: e.provider || undefined, value: Number(e.value) });
const listExternal = asyncWrapper(async (req, res) => res.json((await db.rfinExistingProduct.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "ASC"]] })).map(out)));
const addExternal = asyncWrapper(async (req, res) => {
  const { kind, name, provider } = req.body;
  if (!["investment", "insurance", "loan"].includes(kind)) return res.status(400).json({ error: "Pick investment, insurance or loan" });
  if (String(name || "").trim().length < 2) return res.status(400).json({ error: "Add a name" });
  const value = Math.round(Number(req.body.value));
  if (!(value > 0)) return res.status(400).json({ error: "Enter the value, cover or amount outstanding" });
  const e = await db.rfinExistingProduct.create({ customer_id: req.customer.id, kind, name: String(name).trim(), provider: provider || null, value });
  res.status(201).json(out(e));
});
const removeExternal = asyncWrapper(async (req, res) => {
  const n = await db.rfinExistingProduct.destroy({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ removed: true });
});

// ── Family (Phase 2) ────────────────────────────────────────────────────
const RELATIONS = ["spouse", "child", "parent", "sibling"];
const fam = (f) => ({ id: f.id, name: f.name, relation: f.relation, birthYear: f.birth_year || undefined, dependent: f.dependent, cover: f.cover });
const listFamily = asyncWrapper(async (req, res) => res.json((await db.rfinFamilyMember.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "ASC"]] })).map(fam)));
const addFamily = asyncWrapper(async (req, res) => {
  const { name, relation } = req.body;
  if (String(name || "").trim().length < 2) return res.status(400).json({ error: "Add their name" });
  if (!RELATIONS.includes(relation)) return res.status(400).json({ error: "Pick a relation" });
  const by = req.body.birthYear ? Number(req.body.birthYear) : null;
  if (by && (by < 1920 || by > new Date().getFullYear())) return res.status(400).json({ error: "That birth year doesn't look right" });
  if ((await db.rfinFamilyMember.count({ where: { customer_id: req.customer.id } })) >= 8) return res.status(400).json({ error: "Up to 8 family members" });
  const f = await db.rfinFamilyMember.create({ customer_id: req.customer.id, name: String(name).trim(), relation, birth_year: by, dependent: req.body.dependent !== false, cover: { health: !!req.body.cover?.health, life: !!req.body.cover?.life } });
  res.status(201).json(fam(f));
});
const updateFamily = asyncWrapper(async (req, res) => {
  const f = await db.rfinFamilyMember.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!f) return res.status(404).json({ error: "Not found" });
  if (req.body.dependent !== undefined) f.dependent = !!req.body.dependent;
  if (req.body.cover) {
    f.cover = { ...f.cover, ...Object.fromEntries(Object.entries(req.body.cover).filter(([k, v]) => ["health", "life"].includes(k) && typeof v === "boolean")) };
    f.changed("cover", true);
  }
  await f.save();
  res.json(fam(f));
});
const removeFamily = asyncWrapper(async (req, res) => {
  const n = await db.rfinFamilyMember.destroy({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!n) return res.status(404).json({ error: "Not found" });
  res.json({ removed: true });
});

// ── Goals (report #17) ──────────────────────────────────────────────────
const listGoals = asyncWrapper(async (req, res) => res.json((await db.rfinGoal.findAll({ where: { customer_id: req.customer.id }, order: [["target_date", "ASC"]] })).map(insights.goalProgress)));
const getGoal = asyncWrapper(async (req, res) => {
  const g = await db.rfinGoal.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!g) return res.status(404).json({ error: "Goal not found" });
  res.json(insights.goalProgress(g));
});
const createGoal = asyncWrapper(async (req, res) => {
  const { need, title, targetDate } = req.body;
  const target = Math.round(Number(req.body.target));
  if (!NEEDS.includes(need)) return res.status(400).json({ error: "Pick what the goal is for" });
  if (String(title || "").trim().length < 2) return res.status(400).json({ error: "Name your goal" });
  if (!(target >= 100000)) return res.status(400).json({ error: "Target must be at least ₹1,000" });
  if (!targetDate || new Date(targetDate) <= new Date()) return res.status(400).json({ error: "Pick a date in the future" });
  const g = await db.rfinGoal.create({ customer_id: req.customer.id, need, title: String(title).trim(), target, target_date: targetDate });
  res.status(201).json(insights.goalProgress(g));
});
const contribute = asyncWrapper(async (req, res) => {
  const g = await db.rfinGoal.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!g) return res.status(404).json({ error: "Goal not found" });
  const amount = Math.round(Number(req.body.amount));
  if (!(amount > 0)) return res.status(400).json({ error: "Enter an amount" });
  g.contributions = [...g.contributions, { at: new Date().toISOString(), amount, note: req.body.note ? String(req.body.note).slice(0, 120) : undefined }];
  const p = insights.goalProgress(g);
  if (p.saved >= p.target) g.state = "achieved";
  await g.save();
  res.json(insights.goalProgress(g));
});
const archiveGoal = asyncWrapper(async (req, res) => {
  const g = await db.rfinGoal.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!g) return res.status(404).json({ error: "Goal not found" });
  g.state = "archived";
  await g.save();
  res.json(insights.goalProgress(g));
});

// ── Read models ─────────────────────────────────────────────────────────
const life = asyncWrapper(async (req, res) => res.json(await insights.financialLife(req.customer)));
const recommendations = asyncWrapper(async (req, res) => res.json(await insights.recommendations(req.customer)));
const research = (req, res) => res.json(INSIGHTS);

// ── Private-market alerts ───────────────────────────────────────────────
const listAlerts = asyncWrapper(async (req, res) => res.json(await insights.evaluateAlerts(req.customer.id)));
const createAlert = asyncWrapper(async (req, res) => {
  const { companyId, kind } = req.body;
  if (!(await db.rfinCompany.findByPk(companyId))) return res.status(404).json({ error: "Company not found" });
  if (!["price_above", "price_below", "new_supply"].includes(kind)) return res.status(400).json({ error: "Pick an alert type" });
  const threshold = kind === "new_supply" ? null : Math.round(Number(req.body.threshold));
  if (kind !== "new_supply" && !(threshold > 0)) return res.status(400).json({ error: "Enter a price" });
  if ((await db.rfinAlert.count({ where: { customer_id: req.customer.id, active: true } })) >= 20) return res.status(400).json({ error: "Up to 20 active alerts" });
  await db.rfinAlert.create({ customer_id: req.customer.id, company_id: companyId, kind, threshold });
  res.status(201).json(await insights.evaluateAlerts(req.customer.id));
});
const removeAlert = asyncWrapper(async (req, res) => {
  await db.rfinAlert.destroy({ where: { id: req.params.id, customer_id: req.customer.id } });
  res.json(await insights.evaluateAlerts(req.customer.id));
});

// ── Assistant (Phase 3) ─────────────────────────────────────────────────
const ask = asyncWrapper(async (req, res) => {
  const message = String(req.body.message || "").trim();
  if (!message) return res.status(400).json({ error: "Ask something" });
  if (message.length > 1000) return res.status(400).json({ error: "Keep it under 1,000 characters" });
  const history = Array.isArray(req.body.history) ? req.body.history.filter((h) => ["user", "assistant"].includes(h.role) && typeof h.text === "string") : [];
  res.json(await assistant.reply(req.customer, message, history));
});

// ── Intelligent support: suggested answers while typing (Phase 3) ───────
const STOPWORDS = new Set(["the", "and", "you", "your", "for", "are", "was", "what", "when", "why", "how", "can", "does", "did", "get", "has", "have", "this", "that", "with", "from", "not", "any", "my", "about"]);
const suggest = (req, res) => {
  const words = String(req.query.q || "").toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (!words.length) return res.json([]);
  const scored = FAQS.map((f) => ({ f, s: words.filter((w) => `${f.q} ${f.a}`.toLowerCase().includes(w)).length })).filter((x) => x.s > 0);
  res.json(scored.sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.f));
};

// ── Partner performance insights (report #90) ───────────────────────────
const partnerInsights = asyncWrapper(async (req, res) => {
  const pid = req.customer.id;
  const [leads, commissions] = await Promise.all([db.rfinLead.findAll({ where: { partner_id: pid } }), db.rfinCommission.findAll({ where: { partner_id: pid } })]);
  const closed = leads.filter((l) => ["converted", "lost"].includes(l.state));
  const converted = leads.filter((l) => l.state === "converted");
  res.json({
    leads: leads.length,
    conversionRate: closed.length ? Math.round((converted.length / closed.length) * 100) : 0,
    avgTicket: converted.length ? Math.round(converted.reduce((s, l) => s + Number(l.potential), 0) / converted.length) : 0,
    openPipeline: leads.filter((l) => !["converted", "lost"].includes(l.state)).reduce((s, l) => s + Number(l.potential), 0),
    earned: commissions.reduce((s, c) => s + Number(c.amount), 0),
    commissionPct: PARTNER.commissionPct,
    tips: [
      converted.length < 2 ? "Move qualified leads to a case quickly — cases that start within 48 h convert more often." : "Your conversion is healthy — the opportunity feed has cross-sell ideas for converted clients.",
      "Clients with a sell need convert faster when you verify the demat holding first.",
    ],
  });
});

module.exports = { getFinancial, updateFinancial, listExternal, addExternal, removeExternal, listFamily, addFamily, updateFamily, removeFamily, listGoals, getGoal, createGoal, contribute, archiveGoal, life, recommendations, research, listAlerts, createAlert, removeAlert, ask, suggest, partnerInsights };
