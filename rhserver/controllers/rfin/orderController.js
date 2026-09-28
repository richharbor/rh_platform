const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const { FLOWS, TIMING, PM_FEES, can } = require("../../constants/rfin");
const { advanceOrder, advanceKyc, stamp, later } = require("../../service/rfin/progress");
const serialize = require("../../service/rfin/serialize");
const scenario = require("../../service/rfin/scenario");

const orderId = () => `ORD-${Math.floor(10000 + Math.random() * 89999)}`;

// GET /rfin/orders — newest first, each advanced to "now".
const listOrders = asyncWrapper(async (req, res) => {
  const orders = await db.rfinOrder.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  const fresh = [];
  for (const o of orders) fresh.push(await advanceOrder(o));
  res.json(fresh.map(serialize.order));
});

// GET /rfin/orders/:id
const getOrder = asyncWrapper(async (req, res) => {
  const o = await db.rfinOrder.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!o) return res.status(404).json({ error: "Order not found" });
  res.json(serialize.order(await advanceOrder(o)));
});

// POST /rfin/orders { kind, subjectId, amount, pay } + Idempotency-Key header.
// Same key from the same customer returns the original order, never a second
// one (report #37). KYC required by the product's flow is enforced here, not
// just shown by the client.
const createOrder = asyncWrapper(async (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key) return res.status(400).json({ error: "Missing Idempotency-Key header" });
  const cid = req.customer.id;

  const replay = await db.rfinOrder.findOne({ where: { customer_id: cid, idempotency_key: key } });
  if (replay) return res.status(200).json(serialize.order(replay));

  const { subjectId, amount } = req.body;
  const company = subjectId && (await db.rfinCompany.findByPk(subjectId));
  if (company) return createPmBuy(req, res, company, key);
  const product = subjectId && (await db.rfinProduct.findByPk(subjectId));
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (!product.transactable) return res.status(400).json({ error: "This product can't be applied for yet" });
  const flow = FLOWS[product.category];
  const pays = flow.steps.includes("pay");
  if (pays && !req.customer.roles.some((r) => r === "buyer" || r === "seller")) return res.status(403).json({ error: "Your role can't make payments" });
  if (!(Number(amount) > 0)) return res.status(400).json({ error: "Amount must be positive" });

  const kyc = await advanceKyc(await db.rfinKycItem.findAll({ where: { customer_id: cid } }));
  const missing = flow.kycRequired.filter((k) => !kyc.some((i) => i.item_key === k && i.state === "verified"));
  if (missing.length) return res.status(422).json({ error: `Complete KYC first: ${missing.join(", ")}` });

  try {
    const o = await db.rfinOrder.create({
      id: orderId(),
      customer_id: cid,
      kind: flow.kind,
      subject_id: product.id,
      title: product.name,
      state: "submitted",
      payment: pays ? "pending" : null,
      amount: Math.round(Number(amount)),
      timeline: [stamp("Submitted", "you")],
      next_at: later(TIMING.paymentMs),
      fail_payment: pays && scenario.get().failPayments,
      idempotency_key: key,
    });
    res.status(201).json(serialize.order(o));
  } catch (e) {
    // Two concurrent requests with the same key: the unique index lets one win.
    if (e.name === "SequelizeUniqueConstraintError") {
      const winner = await db.rfinOrder.findOne({ where: { customer_id: cid, idempotency_key: key } });
      return res.status(200).json(serialize.order(winner));
    }
    throw e;
  }
});

// Private-market buy (report #92): Select → Quantity → Review → KYC → Pay →
// Transfer → Portfolio. Priced at the current indicative price; fees shown.
async function createPmBuy(req, res, company, key) {
  const cid = req.customer.id;
  if (!can(req.customer.roles, "private_markets", "buy")) return res.status(403).json({ error: "Your role can't buy private-market shares" });
  if (!company.available) return res.status(409).json({ error: `${company.name} has no supply right now` });
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < company.min_lot || quantity % company.min_lot !== 0) {
    return res.status(400).json({ error: `Buy in lots of ${company.min_lot} shares` });
  }
  const kyc = await advanceKyc(await db.rfinKycItem.findAll({ where: { customer_id: cid } }));
  const missing = FLOWS.private_markets.kycRequired.filter((k) => !kyc.some((i) => i.item_key === k && i.state === "verified"));
  if (missing.length) return res.status(422).json({ error: `Complete KYC first: ${missing.join(", ")}` });

  const unit = serialize.indicativePrice(company);
  const quote = pmQuote(unit, quantity);
  try {
    const o = await db.rfinOrder.create({
      id: orderId(),
      customer_id: cid,
      kind: "pm_buy",
      subject_id: company.id,
      title: company.name,
      state: "submitted",
      payment: "pending",
      amount: quote.total,
      quantity,
      unit_price: unit,
      timeline: [stamp(`Order for ${quantity} shares submitted`, "you")],
      next_at: later(TIMING.paymentMs),
      fail_payment: scenario.get().failPayments,
      idempotency_key: key,
    });
    res.status(201).json(serialize.order(o));
  } catch (e) {
    if (e.name === "SequelizeUniqueConstraintError") {
      const winner = await db.rfinOrder.findOne({ where: { customer_id: cid, idempotency_key: key } });
      return res.status(200).json(serialize.order(winner));
    }
    throw e;
  }
}

/** Consideration + platform fee + stamp duty, all in paise (report #92 review). */
function pmQuote(unit, quantity) {
  const consideration = unit * quantity;
  const platformFee = Math.round((consideration * PM_FEES.platformPct) / 100);
  const stampDuty = Math.round((consideration * PM_FEES.stampDutyPct) / 100);
  return { unitPrice: unit, quantity, consideration, platformFee, stampDuty, total: consideration + platformFee + stampDuty };
}

// POST /rfin/orders/:id/retry-payment
const retryPayment = asyncWrapper(async (req, res) => {
  const o = await db.rfinOrder.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!o) return res.status(404).json({ error: "Order not found" });
  if (o.payment !== "failed") return res.status(409).json({ error: "This payment isn't retryable." });
  Object.assign(o, {
    state: "submitted",
    payment: "pending",
    action: null,
    fail_payment: scenario.get().failPayments,
    next_at: later(TIMING.paymentMs),
    timeline: [...o.timeline, stamp("Payment retried", "you")],
  });
  await o.save();
  res.json(serialize.order(o));
});

// POST /rfin/orders/:id/action { choice } — resolves the order's one pending
// action (report #39), e.g. booking the medical-check slot it offered.
const act = asyncWrapper(async (req, res) => {
  const o = await db.rfinOrder.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!o) return res.status(404).json({ error: "Order not found" });
  const a = o.action;
  if (!a || o.state !== "action_required") return res.status(409).json({ error: "Nothing to do on this order right now" });
  if (a.type !== "schedule") return res.status(400).json({ error: "Use the order's own button for this" });
  const choice = req.body.choice;
  if (!Array.isArray(a.options) || !a.options.includes(choice)) return res.status(400).json({ error: "Pick one of the offered slots" });
  const d = new Date(choice);
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const h = d.getHours();
  const when = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;
  const timeline = o.timeline.filter((t) => t.done);
  timeline.push(stamp(`Medical check booked · ${when}`, "you"));
  Object.assign(o, { state: "processing", action: null, timeline, next_at: later(TIMING.fulfilMs) });
  await o.save();
  res.json(serialize.order(o));
});

module.exports = { listOrders, getOrder, createOrder, retryPayment, act, pmQuote };
