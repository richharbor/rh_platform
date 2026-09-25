const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const { FLOWS, TIMING } = require("../../constants/rfin");
const { advanceOrder, advanceKyc, stamp, later } = require("../../service/rfin/progress");
const serialize = require("../../service/rfin/serialize");
const scenario = require("../../service/rfin/scenario");

const orderId = () => `ORD-${Math.floor(10000 + Math.random() * 89999)}`;

// GET /rfin/orders — newest first, each advanced to "now".
const listOrders = asyncWrapper(async (req, res) => {
  const orders = await db.rfinOrder.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  for (const o of orders) await advanceOrder(o);
  res.json(orders.map(serialize.order));
});

// GET /rfin/orders/:id
const getOrder = asyncWrapper(async (req, res) => {
  const o = await db.rfinOrder.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!o) return res.status(404).json({ error: "Order not found" });
  await advanceOrder(o);
  res.json(serialize.order(o));
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

module.exports = { listOrders, getOrder, createOrder, retryPayment };
