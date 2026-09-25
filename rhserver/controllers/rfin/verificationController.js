const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const { TIMING, IFSC_BANKS } = require("../../constants/rfin");
const { advanceKyc, advanceBanks, later } = require("../../service/rfin/progress");
const serialize = require("../../service/rfin/serialize");

// GET /rfin/kyc — the checklist, with any finished reviews applied (report #34).
const listKyc = asyncWrapper(async (req, res) => {
  const items = await db.rfinKycItem.findAll({ where: { customer_id: req.customer.id }, order: [["sort", "ASC"]] });
  await advanceKyc(items);
  res.json(items.map(serialize.kycItem));
});

// POST /rfin/kyc/:itemId/upload { fileName } — file storage (S3) comes later;
// the review is simulated: names containing "blur" are rejected again.
const uploadKyc = asyncWrapper(async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: "Choose a file first" });
  const item = await db.rfinKycItem.findOne({ where: { customer_id: req.customer.id, item_key: req.params.itemId } });
  if (!item) return res.status(404).json({ error: "KYC item not found" });
  if (item.item_key === "bank") return res.status(400).json({ error: "Bank accounts are verified from the bank screen" });
  if (item.state === "verified") return res.status(409).json({ error: "Already verified" });
  Object.assign(item, { state: "in_progress", rejection_reason: null, file_name: String(fileName).slice(0, 255), review_until: later(TIMING.kycReviewMs) });
  await item.save();
  res.status(202).json(serialize.kycItem(item));
});

// GET /rfin/banks
const listBanks = asyncWrapper(async (req, res) => {
  const banks = await db.rfinBankAccount.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "ASC"]] });
  await advanceBanks(banks);
  res.json(banks.map(serialize.bank));
});

// POST /rfin/banks { holder, account, ifsc } — simulated ₹1 penny-drop;
// account numbers ending 0000 fail (report #36).
const addBank = asyncWrapper(async (req, res) => {
  const holder = String(req.body.holder || "").trim();
  const account = String(req.body.account || "").replace(/\D/g, "");
  const ifsc = String(req.body.ifsc || "").toUpperCase();
  if (holder.length < 3) return res.status(400).json({ error: "Enter the account holder's name" });
  if (account.length < 9 || account.length > 18) return res.status(400).json({ error: "Account numbers are 9–18 digits" });
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return res.status(400).json({ error: "IFSC should look like HDFC0001234" });
  const existing = await db.rfinBankAccount.count({ where: { customer_id: req.customer.id } });
  const b = await db.rfinBankAccount.create({
    customer_id: req.customer.id,
    bank: IFSC_BANKS[ifsc.slice(0, 4)] || "Your bank",
    last4: account.slice(-4),
    ifsc,
    holder,
    state: "verifying",
    primary: existing === 0,
    verify_at: later(TIMING.pennyDropMs),
    will_fail: account.endsWith("0000"),
  });
  res.status(201).json(serialize.bank(b));
});

// POST /rfin/consents { subject, items } — append-only, timestamped (report #33).
const recordConsent = asyncWrapper(async (req, res) => {
  const { subject, items } = req.body;
  if (!subject || !Array.isArray(items) || !items.length) return res.status(400).json({ error: "Nothing to consent to" });
  const c = await db.rfinConsent.create({ customer_id: req.customer.id, subject: String(subject), items: items.map(String) });
  res.status(201).json(serialize.consent(c));
});

module.exports = { listKyc, uploadKyc, listBanks, addBank, recordConsent };
