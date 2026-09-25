// Rules shared with both RFIN clients — read straight from rhserver/shared/rfin
// so the server enforces exactly what the apps show.
const RBAC = require("../../shared/rfin/src/rbac.json");
const FLOWS = require("../../shared/rfin/src/flows.json");

const ROLES = Object.keys(RBAC.roles); // buyer · seller · partner

const can = (roles, module, action) =>
  (roles || []).some((r) => (RBAC.roles[r] && RBAC.roles[r][module] ? RBAC.roles[r][module].includes(action) : false));

// Default KYC checklist every new customer starts with (report #34).
const KYC_DEFAULTS = [
  { item_key: "pan", label: "PAN", why: "Required by regulation for any financial transaction" },
  { item_key: "address", label: "Address proof", why: "Confirms your residential address for provider records" },
  { item_key: "bank", label: "Bank account", why: "Where payouts and refunds are sent" },
  { item_key: "selfie", label: "Face check", why: "Confirms the documents belong to you" },
];

// Mock timings: how long a "provider" takes to respond.
const TIMING = {
  paymentMs: 3000,
  fulfilMs: 6000,
  kycReviewMs: 4000,
  pennyDropMs: 3500,
  otpTtlMs: 5 * 60 * 1000,
  otpResendSec: 30,
};

const IFSC_BANKS = { HDFC: "HDFC Bank", ICIC: "ICICI Bank", SBIN: "State Bank of India", UTIB: "Axis Bank", KKBK: "Kotak Mahindra Bank" };

module.exports = { RBAC, FLOWS, ROLES, can, KYC_DEFAULTS, TIMING, IFSC_BANKS };
