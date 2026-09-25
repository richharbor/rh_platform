const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const { ROLES } = require("../../constants/rfin");
const { provisionPartnerBook } = require("../../service/rfin/provision");
const serialize = require("../../service/rfin/serialize");

const NEEDS = ["grow_wealth", "protect_family", "need_funding", "invest_surplus", "sell_asset", "save_plan", "find_opportunity", "refer_someone"];

const overallKyc = async (customerId) => {
  const items = await db.rfinKycItem.findAll({ where: { customer_id: customerId } });
  if (items.every((k) => k.state === "verified")) return "verified";
  if (items.some((k) => k.state === "action_required")) return "action_required";
  if (items.some((k) => k.state === "in_progress" || k.state === "verified")) return "in_progress";
  return "not_started";
};

// GET /rfin/me
const getMe = asyncWrapper(async (req, res) => {
  res.json(serialize.customer(req.customer, await overallKyc(req.customer.id)));
});

// PATCH /rfin/me — profile, needs, onboarding flag, and self-service roles.
// Roles are self-service while partner verification (step 7) isn't built.
const updateMe = asyncWrapper(async (req, res) => {
  const c = req.customer;
  const { name, email, city, needs, roles, onboarded } = req.body;
  if (name !== undefined) {
    if (String(name).trim().length < 2) return res.status(400).json({ error: "Enter your full name" });
    c.name = String(name).trim();
  }
  if (email !== undefined) c.email = email ? String(email).trim() : null;
  if (city !== undefined) c.city = city ? String(city).trim() : null;
  if (needs !== undefined) {
    if (!Array.isArray(needs) || needs.some((n) => !NEEDS.includes(n))) return res.status(400).json({ error: "Unknown goal" });
    c.needs = needs;
  }
  let gainedPartner = false;
  if (roles !== undefined) {
    if (!Array.isArray(roles) || !roles.length || roles.some((r) => !ROLES.includes(r))) return res.status(400).json({ error: "Pick at least one valid role" });
    gainedPartner = roles.includes("partner") && !c.roles.includes("partner");
    c.roles = [...new Set(roles)];
  }
  if (onboarded !== undefined) c.onboarded = !!onboarded;
  try {
    await c.save();
  } catch (e) {
    if (e.name === "SequelizeValidationError") return res.status(400).json({ error: "That doesn't look like an email address" });
    throw e;
  }
  if (gainedPartner) await provisionPartnerBook(c);
  res.json(serialize.customer(c, await overallKyc(c.id)));
});

module.exports = { getMe, updateMe };
