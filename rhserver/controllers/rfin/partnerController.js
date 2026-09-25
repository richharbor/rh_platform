const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");

// GET /rfin/leads — the signed-in partner's pipeline (report #84).
const listLeads = asyncWrapper(async (req, res) => {
  const rows = await db.rfinLead.findAll({ where: { partner_id: req.customer.id }, order: [["updatedAt", "DESC"]] });
  res.json(rows.map(serialize.lead));
});

// GET /rfin/commissions — business-commission ledger, separate from points (report #88).
const listCommissions = asyncWrapper(async (req, res) => {
  const rows = await db.rfinCommission.findAll({ where: { partner_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  res.json(rows.map(serialize.commission));
});

module.exports = { listLeads, listCommissions };
