const jwt = require("jsonwebtoken");
const { ulid } = require("ulid");
const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const { TIMING } = require("../../constants/rfin");
const { provisionCustomer } = require("../../service/rfin/provision");
const serialize = require("../../service/rfin/serialize");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const CUSTOMER_TTL = process.env.RFIN_CUSTOMER_TTL || "30d";
const PHONE = /^[6-9]\d{9}$/;

const rfinId = () => `RFIN-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// POST /rfin/auth/otp — mobile only (report #12). No SMS provider yet: any
// 6-digit code except 000000 verifies. Swap in the provider here later.
const sendOtp = asyncWrapper(async (req, res) => {
  const phone = String(req.body.phone || "").replace(/\D/g, "");
  if (!PHONE.test(phone)) return res.status(400).json({ error: "Indian mobile numbers are 10 digits starting 6–9" });
  const reqRow = await db.rfinOtpRequest.create({ id: ulid(), phone, expires_at: new Date(Date.now() + TIMING.otpTtlMs) });
  res.status(201).json({ requestId: reqRow.id, resendInSec: TIMING.otpResendSec });
});

// POST /rfin/auth/verify — one RFIN ID per phone (report #2); new numbers get
// provisioned with starter data and go through onboarding.
const verifyOtp = asyncWrapper(async (req, res) => {
  const { requestId, code, referralCode } = req.body;
  const otp = requestId && (await db.rfinOtpRequest.findByPk(requestId));
  if (!otp || otp.consumed_at || otp.expires_at < new Date()) return res.status(400).json({ error: "This code has expired. Request a new one." });
  if (!/^\d{6}$/.test(String(code || "")) || code === "000000") return res.status(400).json({ error: "That code didn't match. Check the SMS and try again." });

  const result = await db.sequelize.transaction(async (transaction) => {
    otp.consumed_at = new Date();
    await otp.save({ transaction });
    let customer = await db.rfinCustomer.findOne({ where: { phone: otp.phone }, transaction });
    if (!customer) {
      customer = await db.rfinCustomer.create({ phone: otp.phone, rfin_id: rfinId(), referral_code: referralCode || null }, { transaction });
      await provisionCustomer(customer, transaction);
    }
    return customer;
  });

  const token = jwt.sign({ customer_id: result.id, type: "rfin_customer" }, SECRET_KEY, { expiresIn: CUSTOMER_TTL });
  res.status(200).json({ token, isNew: !result.onboarded, customer: serialize.customer(result) });
});

module.exports = { sendOtp, verifyOtp };
