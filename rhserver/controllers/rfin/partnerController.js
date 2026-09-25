const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");
const { PARTNER, TIMING } = require("../../constants/rfin");
const { advanceProfile, advanceCase, advanceCommissions, advancePayout, advanceKyc, advanceBanks, stamp, later, inr } = require("../../service/rfin/progress");
const { notify } = require("../../service/rfin/notify");

const id = (p) => `${p}-${Math.floor(10000 + Math.random() * 89999)}`;
const SECTIONS = ["basic", "professional", "capabilities", "network", "business", "compliance", "payout"];
const NEEDS = ["grow_wealth", "protect_family", "need_funding", "invest_surplus", "sell_asset", "save_plan", "find_opportunity"];

// ── Onboarding (report #71–#81) ─────────────────────────────────────────

const profileOut = (pp) => ({
  state: pp.state,
  step: pp.step,
  partnerType: pp.partner_type || undefined,
  basic: pp.basic,
  professional: pp.professional,
  capabilities: pp.capabilities,
  network: pp.network,
  business: pp.business,
  compliance: pp.compliance,
  payout: pp.payout,
  partnerId: pp.partner_code || undefined,
  agreementSignedAt: pp.agreement_signed_at ? pp.agreement_signed_at.toISOString() : undefined,
  activatedAt: pp.activated_at ? pp.activated_at.toISOString() : undefined,
  /** Partner 360 completeness per dimension (report #72) */
  dimensions: {
    identity: !!(pp.partner_type && pp.basic.organisation),
    capability: Object.values(pp.capabilities || {}).some((v) => v !== "none"),
    network: !!pp.network.clientBase,
    intent: !!pp.business.annualBusiness,
    compliance: !!(pp.compliance.pan && pp.agreement_signed_at),
    growth: !!pp.business.monthlyLeads,
  },
});

async function loadProfile(customerId) {
  const [pp] = await db.rfinPartnerProfile.findOrCreate({ where: { customer_id: customerId } });
  return advanceProfile(pp);
}

// GET /rfin/partner/profile — draft (created on first read), verifying or active.
const getProfile = asyncWrapper(async (req, res) => res.json(profileOut(await loadProfile(req.customer.id))));

// PATCH /rfin/partner/profile { partnerType?, <section>?, step?, signAgreement? } — save-and-resume.
const updateProfile = asyncWrapper(async (req, res) => {
  const pp = await loadProfile(req.customer.id);
  if (pp.state !== "draft") return res.status(409).json({ error: pp.state === "active" ? "You're already a partner" : "Your application is being verified" });
  const b = req.body;
  if (b.partnerType !== undefined) {
    if (!PARTNER.types.some((t) => t.id === b.partnerType)) return res.status(400).json({ error: "Pick a partner type" });
    pp.partner_type = b.partnerType;
  }
  for (const s of SECTIONS) {
    if (b[s] && typeof b[s] === "object") {
      pp[s] = { ...pp[s], ...b[s] };
      pp.changed(s, true);
    }
  }
  if (b.signAgreement === true) pp.agreement_signed_at = new Date();
  if (Number.isInteger(b.step)) pp.step = Math.max(pp.step, Math.min(b.step, PARTNER.steps.length - 1));
  await pp.save();
  res.json(profileOut(pp));
});

// POST /rfin/partner/profile/submit — validates everything, then verification (~5 s mock).
const submitProfile = asyncWrapper(async (req, res) => {
  const pp = await loadProfile(req.customer.id);
  if (pp.state !== "draft") return res.status(409).json({ error: "Already submitted" });
  const missing = [];
  if (!pp.partner_type) missing.push("partner type");
  if (!pp.basic.organisation || !pp.basic.city) missing.push("organisation and city");
  if (!Object.values(pp.capabilities || {}).some((v) => v !== "none")) missing.push("at least one product capability");
  if (!pp.network.clientBase) missing.push("client base");
  if (!pp.business.annualBusiness) missing.push("business potential");
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(pp.compliance.pan || "")) missing.push("a valid PAN");
  if (!pp.payout.tdsAcknowledged) missing.push("TDS acknowledgement");
  if (!pp.agreement_signed_at) missing.push("signed agreement");
  const banks = await advanceBanks(await db.rfinBankAccount.findAll({ where: { customer_id: req.customer.id } }));
  if (!banks.some((x) => x.state === "verified")) missing.push("a verified bank account for payouts");
  if (missing.length) return res.status(422).json({ error: `Still needed: ${missing.join(", ")}` });
  Object.assign(pp, { state: "verifying", verify_at: later(TIMING.partnerVerifyMs), step: PARTNER.steps.length - 1 });
  await pp.save();
  await notify(req.customer.id, { category: "applications", tone: "pending", title: "Partner application received", body: "We're verifying your details — usually a few minutes.", route: "/partner/onboarding" });
  res.json(profileOut(pp));
});

// ── Leads (report #83, #84) ─────────────────────────────────────────────

const leadOut = (l) => ({
  ...serialize.lead(l),
  phone: l.phone || undefined,
  city: l.city || undefined,
  segment: l.segment || undefined,
  companyId: l.company_id || undefined,
  quantity: l.quantity || undefined,
  documents: l.documents,
  notes: l.notes,
  caseId: l.case_id || undefined,
  allowedNext: PARTNER.leadTransitions[l.state] || [],
});

// POST /rfin/leads { client, phone?, need, productId? | companyId?, quantity?, documents? } — the 60-second flow.
const createLead = asyncWrapper(async (req, res) => {
  const b = req.body;
  const client = String(b.client || "").trim();
  if (client.length < 2) return res.status(400).json({ error: "Add the client's name" });
  if (b.phone && !/^[6-9]\d{9}$/.test(String(b.phone))) return res.status(400).json({ error: "That mobile number doesn't look right" });
  if (!NEEDS.includes(b.need)) return res.status(400).json({ error: "Pick what the client needs" });
  let potential = 0;
  let subject = null;
  if (b.companyId) {
    const c = await db.rfinCompany.findByPk(b.companyId);
    if (!c) return res.status(404).json({ error: "Company not found" });
    const qty = Number(b.quantity) || c.min_lot;
    if (qty % c.min_lot) return res.status(400).json({ error: `${c.name} trades in lots of ${c.min_lot}` });
    potential = serialize.indicativePrice(c) * qty;
    subject = c.name;
  } else if (b.productId) {
    const p = await db.rfinProduct.findByPk(b.productId);
    if (!p) return res.status(404).json({ error: "Product not found" });
    potential = Number(p.min_amount || 1_00_000 * 100);
    subject = p.name;
  }
  const l = await db.rfinLead.create({
    id: id("LD"),
    partner_id: req.customer.id,
    client,
    phone: b.phone || null,
    need: b.need,
    product_id: b.productId || null,
    company_id: b.companyId || null,
    quantity: b.companyId ? Number(b.quantity) || null : null,
    documents: Array.isArray(b.documents) ? b.documents.slice(0, 10).map(String) : [],
    state: "new",
    potential,
    next_action: "Call the client to confirm the requirement",
    notes: [{ at: new Date().toISOString(), text: subject ? `Lead created for ${subject}` : "Lead created" }],
  });
  res.status(201).json(leadOut(l));
});

// GET /rfin/leads, GET /rfin/leads/:id
const listLeads = asyncWrapper(async (req, res) => {
  const rows = await db.rfinLead.findAll({ where: { partner_id: req.customer.id }, order: [["updatedAt", "DESC"]] });
  res.json(rows.map(leadOut));
});
const getLead = asyncWrapper(async (req, res) => {
  const l = await db.rfinLead.findOne({ where: { id: req.params.id, partner_id: req.customer.id } });
  if (!l) return res.status(404).json({ error: "Lead not found" });
  res.json(leadOut(l));
});

// PATCH /rfin/leads/:id { state?, note? } — only allowed transitions; processing opens a case.
const updateLead = asyncWrapper(async (req, res) => {
  const out = await db.sequelize.transaction(async (transaction) => {
    const l = await db.rfinLead.findOne({ where: { id: req.params.id, partner_id: req.customer.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!l) return { status: 404, error: "Lead not found" };
    const notes = [...l.notes];
    if (req.body.note) notes.push({ at: new Date().toISOString(), text: String(req.body.note).slice(0, 500) });
    const to = req.body.state;
    if (to && to !== l.state) {
      if (to === "converted") return { status: 400, error: "Leads convert when their case completes" };
      if (!(PARTNER.leadTransitions[l.state] || []).includes(to)) return { status: 409, error: `A ${l.state} lead can't move to ${to}` };
      l.state = to;
      l.next_action = { contacted: "Qualify the requirement and budget", qualified: "Open a case to start processing", processing: "Track the case to completion", lost: "No further action" }[to];
      notes.push({ at: new Date().toISOString(), text: `Moved to ${to}` });
      if (to === "processing" && !l.case_id) {
        const subject = l.company_id ? (await db.rfinCompany.findByPk(l.company_id, { transaction }))?.name : (await db.rfinProduct.findByPk(l.product_id, { transaction }))?.name;
        const k = await db.rfinCase.create(
          {
            id: id("CS"), partner_id: l.partner_id, lead_id: l.id, client: l.client, subject: subject || "Requirement", value: l.potential,
            stage: "kyc_pending", owner: "Neha · RFIN ops", next_action: PARTNER.caseStages[0].next, sla_due: new Date(Date.now() + 3 * 86400000),
            timeline: [stamp("Case opened", "you")], next_at: later(TIMING.caseStepMs),
          },
          { transaction },
        );
        l.case_id = k.id;
      }
    }
    l.notes = notes;
    await l.save({ transaction });
    return { lead: l };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json(leadOut(out.lead));
});

// ── Cases (report #86) ──────────────────────────────────────────────────

const caseOut = (k) => ({
  id: k.id,
  leadId: k.lead_id,
  client: k.client,
  subject: k.subject,
  value: Number(k.value),
  stage: k.stage,
  stageLabel: (PARTNER.caseStages.find((s) => s.id === k.stage) || {}).label,
  owner: k.owner,
  nextAction: k.next_action || undefined,
  slaDue: k.sla_due ? k.sla_due.toISOString() : undefined,
  timeline: k.timeline,
  createdAt: k.createdAt.toISOString(),
});
const listCases = asyncWrapper(async (req, res) => {
  const rows = await db.rfinCase.findAll({ where: { partner_id: req.customer.id }, order: [["updatedAt", "DESC"]] });
  const fresh = [];
  for (const k of rows) fresh.push(await advanceCase(k));
  res.json(fresh.map(caseOut));
});
const getCase = asyncWrapper(async (req, res) => {
  const k = await db.rfinCase.findOne({ where: { id: req.params.id, partner_id: req.customer.id } });
  if (!k) return res.status(404).json({ error: "Case not found" });
  res.json(caseOut(await advanceCase(k)));
});

// ── Clients (report #85) — derived from the partner's leads ─────────────

const clientKey = (l) => (l.phone || l.client).replace(/\s+/g, "-").toLowerCase();
async function clientsFor(partnerId) {
  const leads = await db.rfinLead.findAll({ where: { partner_id: partnerId }, order: [["createdAt", "ASC"]] });
  const map = new Map();
  for (const l of leads) {
    const k = clientKey(l);
    const c = map.get(k) || { key: k, name: l.client, phone: l.phone || undefined, city: l.city || undefined, segment: l.segment || undefined, leads: [], needs: new Set() };
    c.leads.push(leadOut(l));
    c.needs.add(l.need);
    map.set(k, c);
  }
  return [...map.values()].map((c) => ({
    ...c,
    needs: [...c.needs],
    openValue: c.leads.filter((l) => !["converted", "lost"].includes(l.state)).reduce((s, l) => s + l.potential, 0),
    nextAction: (c.leads.find((l) => !["converted", "lost"].includes(l.state)) || c.leads[c.leads.length - 1]).nextAction,
  }));
}
const listClients = asyncWrapper(async (req, res) => res.json(await clientsFor(req.customer.id)));
const getClient = asyncWrapper(async (req, res) => {
  const c = (await clientsFor(req.customer.id)).find((x) => x.key === req.params.key);
  if (!c) return res.status(404).json({ error: "Client not found" });
  const cases = await db.rfinCase.findAll({ where: { partner_id: req.customer.id, lead_id: c.leads.map((l) => l.id) } });
  res.json({ ...c, cases: cases.map(caseOut) });
});

// GET /rfin/opportunities — next-best actions from client needs + market signals (report #87).
const listOpportunities = asyncWrapper(async (req, res) => {
  const [clients, companies] = await Promise.all([clientsFor(req.customer.id), db.rfinCompany.findAll()]);
  const supply = companies.filter((c) => c.is_new_supply && c.available);
  const ops = [];
  for (const c of clients) {
    if (c.needs.includes("grow_wealth") || c.needs.includes("invest_surplus")) {
      for (const s of supply.slice(0, 1)) ops.push({ id: `op-${c.key}-${s.id}`, client: c.name, clientKey: c.key, title: `${s.name} new supply fits ${c.name.split(" ")[0]}'s goal`, reason: "Client wants growth · new pre-IPO supply available", action: "Share the research note", companyId: s.id, signal: "new_supply" });
    }
    if (c.needs.includes("sell_asset")) ops.push({ id: `op-${c.key}-sell`, client: c.name, clientKey: c.key, title: `Buyer interest for ${c.name.split(" ")[0]}'s holding`, reason: "Client wants to sell · active buyers on the desk", action: "Verify the holding and list it", signal: "buyer_interest" });
    if (c.needs.includes("protect_family") && !c.leads.some((l) => l.state === "converted" && l.productId === "family-health")) ops.push({ id: `op-${c.key}-health`, client: c.name, clientKey: c.key, title: `Cross-sell family health cover to ${c.name.split(" ")[0]}`, reason: "Has protection need · no health cover yet", action: "Share a Family Health quote", signal: "cross_sell" });
  }
  res.json(ops.slice(0, 8));
});

// ── Earnings & payouts (report #88, #89) ────────────────────────────────

const commissionOut = (c) => ({ ...serialize.commission(c), availableAt: c.available_at ? c.available_at.toISOString() : undefined });
const payoutOut = (p) => ({ id: p.id, gross: Number(p.gross), tds: Number(p.tds), net: Number(p.net), state: p.state, bank: p.bank || undefined, count: p.commission_ids.length, at: p.createdAt.toISOString() });

const listCommissions = asyncWrapper(async (req, res) => {
  const rows = await db.rfinCommission.findAll({ where: { partner_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  res.json((await advanceCommissions(rows)).map(commissionOut));
});

const listPayouts = asyncWrapper(async (req, res) => {
  const rows = await db.rfinPayout.findAll({ where: { partner_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  const fresh = [];
  for (const p of rows) fresh.push(await advancePayout(p));
  res.json(fresh.map(payoutOut));
});

// POST /rfin/payouts — sweeps all available commission, TDS deducted, to the primary bank.
const requestPayout = asyncWrapper(async (req, res) => {
  const pid = req.customer.id;
  await advanceCommissions(await db.rfinCommission.findAll({ where: { partner_id: pid, state: "pending" } }));
  const out = await db.sequelize.transaction(async (transaction) => {
    const avail = await db.rfinCommission.findAll({ where: { partner_id: pid, state: "available" }, transaction, lock: transaction.LOCK.UPDATE });
    const gross = avail.reduce((s, c) => s + Number(c.amount), 0);
    if (!gross) return { status: 409, error: "Nothing available to pay out yet" };
    if (gross < PARTNER.payoutThreshold) return { status: 400, error: `Minimum payout is ${inr(PARTNER.payoutThreshold)}` };
    const bank = await db.rfinBankAccount.findOne({ where: { customer_id: pid, state: "verified" }, order: [["primary", "DESC"]], transaction });
    if (!bank) return { status: 422, error: "Add and verify a bank account first" };
    const tds = Math.round((gross * PARTNER.tdsPct) / 100);
    await db.rfinCommission.update({ state: "on_hold" }, { where: { id: avail.map((c) => c.id) }, transaction });
    const p = await db.rfinPayout.create(
      { id: id("PO"), partner_id: pid, gross, tds, net: gross - tds, state: "processing", commission_ids: avail.map((c) => c.id), bank: `${bank.bank} •••• ${bank.last4}`, next_at: later(TIMING.payoutMs) },
      { transaction },
    );
    return { payout: p };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.status(201).json(payoutOut(out.payout));
});

// GET /rfin/partner/resources — training + marketing (report #81, #90).
const resources = (req, res) => res.json(PARTNER.resources);

module.exports = { getProfile, updateProfile, submitProfile, createLead, listLeads, getLead, updateLead, listCases, getCase, listClients, getClient, listOpportunities, listCommissions, listPayouts, requestPayout, resources };
