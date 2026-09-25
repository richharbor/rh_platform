"use strict";

const db = require("../../models");
const { provisionCustomer } = require("../../service/rfin/provision");

// RFIN mock data — the same catalogue the apps used to carry in memory, now in
// the rfin schema. Idempotent: upserts by id, so it's safe to run repeatedly
// (npm run db:seed:rfin). Amounts are paise.
const L = 100;

const products = [
  {
    id: "term-shield", category: "insurance", name: "Term Shield 1 Cr", provider: "Harbor Life",
    tagline: "Pure term cover for your family", who_for: "Earning members aged 18–60 with dependants",
    requirements: ["PAN", "Income proof", "Medical declaration"],
    costs: [{ label: "Premium from", value: "₹1,050 / month" }, { label: "Policy term", value: "Up to 40 years" }],
    risks: ["No maturity payout", "Claims subject to disclosure accuracy"],
    what_next: ["Instant quote", "Medical check may be scheduled", "Policy issued in 3–7 days"],
  },
  {
    id: "family-health", category: "insurance", name: "Family Health Floater", provider: "Anchor General",
    tagline: "₹10 L cover shared across the family", who_for: "Families of up to 6 members",
    requirements: ["Member details", "Pre-existing condition disclosure"],
    costs: [{ label: "Premium from", value: "₹1,420 / month" }, { label: "Waiting period", value: "2 years for PEDs" }],
    risks: ["Sub-limits on room rent", "Waiting periods apply"],
    what_next: ["Quote", "Proposal review", "Policy in 1–3 days"],
  },
  {
    id: "personal-loan", category: "loans", name: "Personal Loan", provider: "Keel Finance",
    tagline: "Up to ₹25 L, disbursal in 48 hours", who_for: "Salaried with 1+ year employment",
    requirements: ["PAN", "Aadhaar", "3 months' salary slips", "Bank statement"],
    costs: [{ label: "Interest", value: "10.5% – 18% p.a." }, { label: "Processing fee", value: "Up to 2%" }],
    risks: ["Late payment charges", "Affects credit score"],
    what_next: ["Indicative eligibility", "Document check", "Provider approval", "Disbursal"],
    min_amount: 50_000 * L,
  },
  {
    id: "lap", category: "loans", name: "Loan Against Property", provider: "Keel Finance",
    tagline: "Unlock up to 65% of property value", who_for: "Owners of residential or commercial property",
    requirements: ["Property papers", "Income proof", "KYC"],
    costs: [{ label: "Interest", value: "9% – 12% p.a." }, { label: "Tenure", value: "Up to 15 years" }],
    risks: ["Property is collateral", "Valuation may differ from expectation"],
    what_next: ["Eligibility", "Valuation", "Legal check", "Disbursal"],
    min_amount: 10_00_000 * L,
  },
  {
    id: "corp-bond-aa", category: "investments", name: "AA Corporate Bond Basket", provider: "Harbor Fixed Income",
    tagline: "Indicative yield 9.2% p.a.", who_for: "Investors seeking regular income, 2–3 year horizon",
    requirements: ["KYC", "Demat account"],
    costs: [{ label: "Minimum", value: "₹10,000" }, { label: "Indicative yield", value: "9.2% p.a." }],
    risks: ["Credit risk of issuer", "Limited secondary liquidity", "Yield is indicative, not guaranteed"],
    what_next: ["Order", "Payment", "Allotment in T+1"],
    min_amount: 10_000 * L,
  },
].map((p, i) => ({ transactable: true, min_amount: null, ...p, sort: i }));

const price = (kind, rupees, asOf, source) => ({ kind, perShare: rupees * L, asOf, source });

const companies = [
  {
    id: "nse", name: "National Stock Exchange", sector: "Financial Services", themes: ["Market infrastructure", "Pre-IPO"],
    summary: "India's largest stock exchange by trading volume.",
    prices: [price("current_indicative", 1750, "2026-09-20", "RFIN desk"), price("secondary_trade", 1720, "2026-09-12", "Verified secondary trade")],
    min_lot: 50, available: true, is_new_supply: false,
    risks: ["Unlisted: no exchange liquidity", "IPO timing uncertain"],
    transfer_restrictions: ["Transfer via off-market demat only", "Lock-in may apply post-IPO"],
  },
  {
    id: "zepto", name: "Zepto", sector: "Consumer Internet", themes: ["Quick commerce", "Pre-IPO"],
    summary: "10-minute grocery delivery across Indian metros.",
    prices: [price("current_indicative", 520, "2026-09-18", "RFIN desk"), price("latest_funding_round", 480, "2025-11-01", "Series G")],
    min_lot: 100, available: true, is_new_supply: true,
    risks: ["Loss-making", "Valuation based on private rounds", "High concentration risk"],
    transfer_restrictions: ["ROFR applies — company may block transfer", "Board approval required"],
  },
  {
    id: "hdb", name: "HDB Financial Services", sector: "Financial Services", themes: ["NBFC"],
    summary: "Retail-focused NBFC subsidiary of a large private bank.",
    prices: [price("indicative_mark", 1010, "2026-09-01", "RFIN valuation mark")],
    min_lot: 25, available: false, is_new_supply: false,
    risks: ["Credit-cycle exposure"], transfer_restrictions: ["Off-market demat transfer"],
  },
];

const draws = [
  {
    id: "festive-26", name: "Festive Lucky Draw", threshold: 3, draw_date: "2026-11-15", prize: "Gift cards worth ₹50,000",
    terms: "Three eligible transactions between 1 Sep and 31 Oct 2026. One entry per customer.", active: true,
  },
];

// Existing account for sign-in testing: skips onboarding.
const DEMO = { phone: "9876543210", rfin_id: "RFIN-7K2Q9", name: "Aarav Mehta", email: "aarav@example.com", city: "Mumbai", needs: ["grow_wealth", "protect_family"], roles: ["buyer"], onboarded: true };

module.exports = {
  async up() {
    await db.sequelize.transaction(async (transaction) => {
      for (const p of products) await db.rfinProduct.upsert(p, { transaction });
      for (const c of companies) await db.rfinCompany.upsert(c, { transaction });
      for (const d of draws) await db.rfinLuckyDraw.upsert(d, { transaction });
      const [demo, created] = await db.rfinCustomer.findOrCreate({ where: { phone: DEMO.phone }, defaults: DEMO, transaction });
      if (created) await provisionCustomer(demo, transaction);
    });
  },

  async down() {
    await db.rfinCustomer.destroy({ where: { phone: DEMO.phone } });
    await db.rfinLuckyDraw.destroy({ where: { id: draws.map((d) => d.id) } });
    await db.rfinCompany.destroy({ where: { id: companies.map((c) => c.id) } });
    await db.rfinProduct.destroy({ where: { id: products.map((p) => p.id) } });
  },
};
