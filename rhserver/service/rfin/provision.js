// Starter data for a new RFIN customer so every screen has something real to
// show — the same shape the old in-app mock had, now stored in Postgres.
const db = require("../../models");
const { KYC_DEFAULTS } = require("../../constants/rfin");

const L = 100; // paise per rupee
const oid = (p) => `${p}-${Math.floor(10000 + Math.random() * 89999)}`;

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
      action: { label: "Pick a medical check slot", route: "/activity", reason: "The insurer needs a basic health check before issuing the policy." },
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
  ].map(([client, need, product_id, state, rupees, next_action]) => ({ id: oid("LD"), partner_id: pid, client, need, product_id, state, potential: rupees * L, next_action }));
  await Lead.bulkCreate(leads, { transaction });
  const byClient = Object.fromEntries(leads.map((l) => [l.client, l.id]));
  await Commission.bulkCreate(
    [
      { id: oid("CM"), partner_id: pid, description: "Ananya Rao · AA Bond Basket", amount: 7_500 * L, state: "available", case_id: byClient["Ananya Rao"] },
      { id: oid("CM"), partner_id: pid, description: "Meera Nair · Personal Loan", amount: 12_000 * L, state: "pending", case_id: byClient["Meera Nair"] },
      { id: oid("CM"), partner_id: pid, description: "August payout", amount: 23_000 * L, state: "paid" },
    ],
    { transaction },
  );
}

module.exports = { provisionCustomer, provisionPartnerBook };
