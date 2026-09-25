const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");

// GET /rfin/points — points ledger only (report #53).
const listPoints = asyncWrapper(async (req, res) => {
  const rows = await db.rfinPointEntry.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  res.json(rows.map(serialize.point));
});

// GET /rfin/draws — this customer's progress in each active draw (report #61).
const listDraws = asyncWrapper(async (req, res) => {
  const rows = await db.rfinLuckyDrawEntry.findAll({
    where: { customer_id: req.customer.id },
    include: [{ model: db.rfinLuckyDraw, as: "draw", where: { active: true } }],
  });
  res.json(rows.map(serialize.draw));
});

module.exports = { listPoints, listDraws };
