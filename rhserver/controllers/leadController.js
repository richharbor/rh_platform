"use strict";

const { Op } = require("sequelize");
const asyncWrapper = require("../utils/asyncWrapper");
const { getPaginationParams, getMeta } = require("../utils/pagination");
const { platformLead: PlatformLead } = require("../models");

const VALID_STATUSES = [
  "Not interested",
  "Positive",
  "Hot Lead",
  "Next Cohort",
  "Paid",
];

// Ported from tps-next-backend's controllers/platformLeadController.js,
// trimmed to the admin-management subset only. Dropped entirely: createLead,
// updateLeadPhone, createLeadStepOne/updateLeadStepOne/updateLeadStepTwo
// (public intake + OTP flow), and anything touching PhoneVerification or
// the workflow trigger service.

// GET /leads?search=&type=&status=&page=&limit=
const getAllLeads = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query, 20, 100);
  const { search, type, status } = req.query;

  const whereClause = {};

  if (search && search.trim()) {
    const cleanedSearch = search.trim();
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${cleanedSearch}%` } },
      { email: { [Op.iLike]: `%${cleanedSearch}%` } },
      { phone: { [Op.iLike]: `%${cleanedSearch}%` } },
    ];
  }

  if (type && type !== "all") {
    if (type.includes(",")) {
      whereClause.type = { [Op.in]: type.split(",").map((t) => t.trim()) };
    } else {
      whereClause.type = type;
    }
  }

  if (status && status !== "all") {
    if (status.includes(",")) {
      whereClause.status = {
        [Op.in]: status.split(",").map((s) => s.trim()),
      };
    } else {
      whereClause.status = status;
    }
  }

  const { count, rows } = await PlatformLead.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const meta = getMeta(count, page, limit);

  return res.status(200).json({ success: true, data: rows, meta });
});

// GET /leads/:id
const getLeadById = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const lead = await PlatformLead.findByPk(id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  return res.status(200).json({ success: true, data: lead });
});

// PATCH /leads/:id/status
const updateLeadStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  const lead = await PlatformLead.findByPk(id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  lead.status = status;
  await lead.save();

  return res
    .status(200)
    .json({ success: true, message: "Lead status updated successfully", data: lead });
});

// PATCH /leads/:id/assign
const assignLead = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ success: false, message: "assignedTo is required" });
  }

  const lead = await PlatformLead.findByPk(id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  lead.assignedTo = assignedTo;
  await lead.save();

  return res
    .status(200)
    .json({ success: true, message: "Lead assigned successfully", data: lead });
});

// PATCH /leads/:id/unassign
const unassignLead = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const lead = await PlatformLead.findByPk(id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  lead.assignedTo = null;
  await lead.save();

  return res.status(200).json({ success: true, message: "Lead unassigned", data: lead });
});

// DELETE /leads/:id
const deleteLead = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const lead = await PlatformLead.findByPk(id);
  if (!lead) {
    return res.status(404).json({ success: false, message: "Lead not found" });
  }

  await lead.destroy();

  return res.status(200).json({ success: true, message: "Lead deleted successfully" });
});

// DELETE /leads (bulk) — body: { ids: [1,2,3] }
const deleteLeadsByIds = asyncWrapper(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "An array of lead IDs is required" });
  }

  const deletedCount = await PlatformLead.destroy({
    where: { id: { [Op.in]: ids } },
  });

  if (deletedCount === 0) {
    return res
      .status(404)
      .json({ success: false, message: "No leads found for the given IDs" });
  }

  return res
    .status(200)
    .json({ success: true, message: `Deleted ${deletedCount} lead(s) successfully` });
});

// Minimal CSV field-escaping: wrap in quotes and double up any embedded
// quotes if the value contains a comma, quote, or newline.
const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const str =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// GET /leads/download?type=&status=&startDate=&endDate=
// Hand-rolled CSV generation (no CSV-writer dependency in this build's
// package list — see report).
const downloadLeads = asyncWrapper(async (req, res) => {
  const { startDate, endDate, type = "all", status = "all" } = req.query;

  const whereClause = {};

  if (type && type !== "all") {
    whereClause.type = type;
  }

  if (status && status !== "all") {
    whereClause.status = status;
  }

  if (startDate && endDate) {
    whereClause.createdAt = {
      [Op.between]: [
        new Date(new Date(startDate).setHours(0, 0, 0, 0)),
        new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      ],
    };
  } else if (startDate) {
    whereClause.createdAt = {
      [Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
    };
  } else if (endDate) {
    whereClause.createdAt = {
      [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    };
  }

  const leads = await PlatformLead.findAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
  });

  const columns = [
    "id",
    "name",
    "email",
    "phone",
    "type",
    "status",
    "assignedTo",
    "additionalData",
    "createdAt",
    "updatedAt",
  ];

  const headerRow = columns.join(",");
  const dataRows = leads.map((lead) => {
    const json = lead.toJSON();
    return columns.map((col) => csvEscape(json[col])).join(",");
  });

  const csv = [headerRow, ...dataRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="platform-leads-${Date.now()}.csv"`
  );
  return res.status(200).send(csv);
});

module.exports = {
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  assignLead,
  unassignLead,
  deleteLead,
  deleteLeadsByIds,
  downloadLeads,
};
