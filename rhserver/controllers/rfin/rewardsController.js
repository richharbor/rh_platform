const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");
const { advanceBenefit, advanceReferral } = require("../../service/rfin/progress");
const { REWARDS, tierFor } = require("../../constants/rfin");

const refId = () => `RF-${Math.floor(10000 + Math.random() * 89999)}`;
const NEEDS = ["grow_wealth", "protect_family", "need_funding", "invest_surplus", "sell_asset", "save_plan", "find_opportunity", "refer_someone"];

// GET /rfin/rewards/summary — balances by state, tier, next tier (report #56, #59, #69).
const summary = asyncWrapper(async (req, res) => {
  const cid = req.customer.id;
  const points = await db.rfinPointEntry.findAll({ where: { customer_id: cid } });
  const sum = (states) => points.filter((p) => states.includes(p.state)).reduce((s, p) => s + p.points, 0);
  const available = sum(["eligible", "issued"]);
  const locked = sum(["locked"]);
  const earned = available + locked + sum(["converted"]);
  const { tier, next } = tierFor(earned);
  const benefits = [];
  for (const b of await db.rfinBenefit.findAll({ where: { customer_id: cid } })) benefits.push(await advanceBenefit(b));
  res.json({
    points: { available, locked, lifetime: earned },
    tier: { ...tier, next: next ? { ...next, pointsToGo: next.minPoints - earned } : null },
    tiers: REWARDS.tiers,
    benefits: {
      available: benefits.filter((b) => ["ready", "partially_used"].includes(b.state)).length,
      pending: benefits.filter((b) => b.state === "processing").length,
    },
    referral: { code: req.customer.own_code, reward: REWARDS.referral.reward, rule: REWARDS.referral.rule },
    note: REWARDS.note,
  });
});

// GET /rfin/points (unchanged ledger) lives in listPoints.
const listPoints = asyncWrapper(async (req, res) => {
  const rows = await db.rfinPointEntry.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  res.json(rows.map(serialize.point));
});

// GET /rfin/draws — this customer's progress in every draw, active first.
const listDraws = asyncWrapper(async (req, res) => {
  const rows = await db.rfinLuckyDrawEntry.findAll({ where: { customer_id: req.customer.id }, include: [{ model: db.rfinLuckyDraw, as: "draw" }] });
  rows.sort((a, b) => Number(b.draw.active) - Number(a.draw.active));
  res.json(rows.map(serialize.draw));
});

// GET /rfin/draws/:id — campaign detail, rules and result (report #62, #64).
const getDraw = asyncWrapper(async (req, res) => {
  const e = await db.rfinLuckyDrawEntry.findOne({ where: { customer_id: req.customer.id, draw_id: req.params.id }, include: [{ model: db.rfinLuckyDraw, as: "draw" }] });
  if (!e) return res.status(404).json({ error: "Draw not found" });
  res.json(serialize.draw(e));
});

// GET /rfin/benefits — the benefit ledger (report #57, #59).
const listBenefits = asyncWrapper(async (req, res) => {
  const rows = await db.rfinBenefit.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  const fresh = [];
  for (const b of rows) fresh.push(await advanceBenefit(b));
  res.json(fresh.map(serialize.benefit));
});

// GET /rfin/benefits/:id
const getBenefit = asyncWrapper(async (req, res) => {
  const b = await db.rfinBenefit.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!b) return res.status(404).json({ error: "Benefit not found" });
  res.json(serialize.benefit(await advanceBenefit(b)));
});

// POST /rfin/benefits/:id/redeem — mark used (mock redemption; the real one is the issuer's).
const redeem = asyncWrapper(async (req, res) => {
  const out = await db.sequelize.transaction(async (transaction) => {
    const b = await db.rfinBenefit.findOne({ where: { id: req.params.id, customer_id: req.customer.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!b) return { status: 404, error: "Benefit not found" };
    if (!["ready", "partially_used"].includes(b.state)) return { status: 409, error: b.state === "processing" ? "Still being issued" : "This benefit can't be used any more" };
    Object.assign(b, { state: "used", redeemed_at: new Date() });
    await b.save({ transaction });
    return { benefit: b };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json(serialize.benefit(out.benefit));
});

// GET /rfin/referrals — referral ledger (report #67), separate from points and cash.
const listReferrals = asyncWrapper(async (req, res) => {
  const rows = await db.rfinReferral.findAll({ where: { referrer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  const fresh = [];
  for (const r of rows) fresh.push(await advanceReferral(r));
  res.json(fresh.map(serialize.referral));
});

// POST /rfin/referrals { need, name, phone? } — returns what to share (report #66).
const createReferral = asyncWrapper(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = req.body.phone ? String(req.body.phone).replace(/\D/g, "") : null;
  if (!NEEDS.includes(req.body.need)) return res.status(400).json({ error: "Pick what they need help with" });
  if (name.length < 2) return res.status(400).json({ error: "Add their name" });
  if (phone && !/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: "That mobile number doesn't look right" });
  if (phone && phone === req.customer.phone) return res.status(400).json({ error: "You can't refer yourself" });
  if (phone && (await db.rfinCustomer.count({ where: { phone } }))) return res.status(409).json({ error: `${name} is already on RFIN` });
  const r = await db.rfinReferral.create({ id: refId(), referrer_id: req.customer.id, need: req.body.need, invitee_name: name, invitee_phone: phone, reward: REWARDS.referral.reward });
  const code = req.customer.own_code;
  res.status(201).json({
    referral: serialize.referral(r),
    share: {
      code,
      link: `https://rfin.app/join?ref=${code}`,
      message: `${name}, I use RFIN for my finances — here's my invite: https://rfin.app/join?ref=${code} (code ${code})`,
    },
  });
});

module.exports = { summary, listPoints, listDraws, getDraw, listBenefits, getBenefit, redeem, listReferrals, createReferral };
