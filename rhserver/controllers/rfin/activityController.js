const { Op } = require("sequelize");
const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");
const { advanceKyc } = require("../../service/rfin/progress");
const { SERVICE } = require("../../service/rfin/notify");

// GET /rfin/documents — every record in one place (report #46).
const listDocuments = asyncWrapper(async (req, res) => {
  // Let pending KYC reviews finish first so document states are current.
  await advanceKyc(await db.rfinKycItem.findAll({ where: { customer_id: req.customer.id, state: "in_progress" } }));
  const rows = await db.rfinDocument.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  res.json(rows.map(serialize.document));
});

// GET /rfin/notifications — newest first, with unread count (report #48).
const listNotifications = asyncWrapper(async (req, res) => {
  const rows = await db.rfinNotification.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]], limit: 100 });
  res.json({ unread: rows.filter((r) => !r.read_at).length, items: rows.map(serialize.notification) });
});

// POST /rfin/notifications/read { ids?: number[] } — no ids = mark all read.
const markRead = asyncWrapper(async (req, res) => {
  const where = { customer_id: req.customer.id, read_at: null };
  if (Array.isArray(req.body.ids) && req.body.ids.length) where.id = { [Op.in]: req.body.ids.map(Number) };
  const [count] = await db.rfinNotification.update({ read_at: new Date() }, { where });
  res.json({ updated: count });
});

// GET /rfin/notification-preferences
const getPrefs = asyncWrapper(async (req, res) => {
  res.json({ ...req.customer.notification_prefs, locked: SERVICE.filter((c) => c !== "support") });
});

// PATCH /rfin/notification-preferences { channels?, categories? } (report #49).
// Service categories (applications, kyc, payments) always stay on.
const updatePrefs = asyncWrapper(async (req, res) => {
  const cur = req.customer.notification_prefs;
  const pick = (src, keys) => Object.fromEntries(Object.entries(src || {}).filter(([k, v]) => keys.includes(k) && typeof v === "boolean"));
  const channels = { ...cur.channels, ...pick(req.body.channels, Object.keys(cur.channels)) };
  const categories = { ...cur.categories, ...pick(req.body.categories, Object.keys(cur.categories)) };
  for (const c of SERVICE) if (c in categories) categories[c] = true;
  if (!Object.values(channels).some(Boolean)) return res.status(400).json({ error: "Keep at least one channel on so we can reach you about your money" });
  req.customer.notification_prefs = { channels, categories };
  req.customer.changed("notification_prefs", true);
  await req.customer.save();
  res.json({ channels, categories, locked: SERVICE.filter((c) => c !== "support") });
});

module.exports = { listDocuments, listNotifications, markRead, getPrefs, updatePrefs };
