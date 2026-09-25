// Starter data for a new RFIN customer so every screen has something real to
// show — the same shape the old in-app mock had, now stored in Postgres.
const db = require("../../models");
const { KYC_DEFAULTS } = require("../../constants/rfin");

const L = 100; // paise per rupee
const oid = (p) => `${p}-${Math.floor(10000 + Math.random() * 89999)}`;

/** The next three weekday mornings/afternoons, for the medical-check action. */
function medicalAction() {
  const slots = [];
  const d = new Date();
  while (slots.length < 4) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue;
    for (const h of [9, 15]) {
      if (slots.length < 4) slots.push(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h).toISOString());
    }
  }
  return {
    type: "schedule",
    label: "Pick a medical check slot",
    route: "/activity",
    reason: "The insurer needs a basic health check before issuing the policy. It's at home and takes 20 minutes.",
    options: slots,
  };
}

async function provisionCustomer(customer, transaction) {
  const { rfinKycItem: Kyc, rfinPointEntry: Point, rfinLuckyDraw: Draw, rfinLuckyDrawEntry: Entry, rfinOrder: Order } = db;
  const cid = customer.id;

  await Kyc.bulkCreate(
    KYC_DEFAULTS.map((k, i) => ({
      ...k,
      customer_id: cid,
      sort: i,
      // Demo realism: PAN arrives verified; the address proof comes back blurry.
      state: k.item_key === "pan" ? "verified" : k.item_key === "address" ? "action_required" : "not_started",
      rejection_reason: k.item_key === "address" ? "The image was blurred — the address line isn't readable. Please upload a clearer photo." : null,
    })),
    { transaction },
  );

  // Welcome reward (report #52): locked until the first eligible transaction.
  await Point.create({ customer_id: cid, description: "Welcome reward", points: 1000, state: "locked", ref: "WELCOME" }, { transaction });

  const { notify } = require("./notify");
  await notify(cid, { category: "rewards", tone: "pending", title: "1,000 welcome points issued", body: "They unlock with your first eligible transaction.", route: "/rewards" }, transaction);
  await notify(cid, { category: "kyc", tone: "action", title: "Address proof needs a clearer photo", body: "The address line isn't readable. Re-upload to continue.", route: "/kyc/upload/address" }, transaction);
  await db.rfinDocument.create({ customer_id: cid, kind: "kyc", title: "PAN card", kyc_item: "pan", state: "available", file_name: "pan.jpg" }, { transaction });
  await db.rfinDocument.create({ customer_id: cid, kind: "kyc", title: "Address proof", kyc_item: "address", state: "requested" }, { transaction });

  if (!customer.own_code) {
    customer.own_code = `RF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await customer.save({ transaction });
  }

  const draws = await Draw.findAll({ where: { active: true }, transaction });
  await Entry.bulkCreate(draws.map((d) => ({ customer_id: cid, draw_id: d.id, progress: 1, state: "progress" })), { transaction });

  const at = new Date().toISOString();
  await Order.create(
    {
      id: oid("ORD"),
      customer_id: cid,
      kind: "application",
      subject_id: "term-shield",
      title: "Term Shield 1 Cr",
      state: "action_required",
      payment: "success",
      amount: 1_050 * L,
      timeline: [
        { at, label: "Application submitted", done: true, actor: "you" },
        { at, label: "Payment received", done: true, actor: "rfin" },
        { at: "", label: "Medical check scheduling", done: false, actor: "provider" },
      ],
      action: medicalAction(),
    },
    { transaction },
  );
}

/** Sample book for a customer who takes on the partner role (report #82–#89). */
async function provisionPartnerBook(customer, transaction) {
  const { rfinLead: Lead, rfinCommission: Commission } = db;
  if (await Lead.count({ where: { partner_id: customer.id }, transaction })) return;
  const pid = customer.id;
  const leads = [
    ["Priya Sharma", "grow_wealth", "nse", "qualified", 25_00_000, "Share NSE research note"],
    ["Rohan Iyer", "protect_family", "term-shield", "new", 1_20_000, "Call to confirm cover amount"],
    ["Meera Nair", "need_funding", "personal-loan", "processing", 8_00_000, "Waiting on salary slips"],
    ["Kabir Shah", "sell_asset", null, "contacted", 40_00_000, "Verify demat holding"],
    ["Ananya Rao", "invest_surplus", "corp-bond-aa", "converted", 5_00_000, "Send allotment confirmation"],
  ].map(([client, need, product_id, state, rupees, next_action], i) => ({
    id: oid("LD"),
    partner_id: pid,
    client,
    need,
    product_id: product_id === "nse" ? null : product_id,
    company_id: product_id === "nse" ? "nse" : null,
    state,
    potential: rupees * L,
    next_action,
    phone: `98${String(20000000 + i * 1234567).slice(0, 8)}`,
    city: ["Mumbai", "Pune", "Bengaluru", "Delhi", "Chennai"][i],
    segment: ["HNI", "Retail", "Retail", "UHNI", "HNI"][i],
  }));
  await Lead.bulkCreate(leads, { transaction });
  // The lead already in processing has a live case (report #86).
  const proc = leads.find((l) => l.state === "processing");
  if (proc) {
    const { PARTNER, TIMING } = require("../../constants/rfin");
    const caseId = `CS-${Math.floor(10000 + Math.random() * 89999)}`;
    const at = new Date().toISOString();
    await db.rfinCase.create(
      {
        id: caseId, partner_id: pid, lead_id: proc.id, client: proc.client, subject: "Personal Loan", value: proc.potential,
        stage: "kyc_verified", owner: "Neha · RFIN ops", next_action: PARTNER.caseStages[1].next, sla_due: new Date(Date.now() + 2 * 86400000),
        timeline: [{ at, label: "Case opened", done: true, actor: "you" }, { at, label: "KYC verified", done: true, actor: "rfin" }],
        next_at: new Date(Date.now() + TIMING.caseStepMs),
      },
      { transaction },
    );
    await Lead.update({ case_id: caseId }, { where: { id: proc.id }, transaction });
  }

  const meeraCase = proc ? (await db.rfinCase.findOne({ where: { lead_id: proc.id }, transaction }))?.id : null;
  await Commission.bulkCreate(
    [
      { id: oid("CM"), partner_id: pid, description: "Ananya Rao · AA Bond Basket", amount: 7_500 * L, state: "available", case_id: null },
      { id: oid("CM"), partner_id: pid, description: "Meera Nair · Personal Loan", amount: 12_000 * L, state: "pending", case_id: meeraCase, available_at: new Date(Date.now() + 60_000) },
      { id: oid("CM"), partner_id: pid, description: "August payout", amount: 23_000 * L, state: "paid" },
    ],
    { transaction },
  );
}

module.exports = { provisionCustomer, provisionPartnerBook, medicalAction };
