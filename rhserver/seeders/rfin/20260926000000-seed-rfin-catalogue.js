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

const fin = (rows) => rows.map(([year, revenue, profit]) => ({ year, revenue, profit, margin: Math.round((profit / revenue) * 1000) / 10 }));
const docs = (name) => [
  { title: `${name} — annual report FY26`, kind: "annual_report" },
  { title: `${name} — shareholding pattern`, kind: "shareholding" },
  { title: "RFIN research note", kind: "research" },
];

const companies = [
  {
    id: "nse", name: "National Stock Exchange", sector: "Financial Services", themes: ["Market infrastructure", "Pre-IPO"],
    summary: "India's largest stock exchange by trading volume.", founded: 1992, hq: "Mumbai",
    business: { model: "Earns transaction, listing, data and clearing fees on India's busiest equity and derivatives markets.", segments: ["Equity & derivatives trading", "Clearing & settlement", "Data & indices"], moat: "Network effects in liquidity; near-monopoly in equity derivatives." },
    financials: fin([["FY22", 8930, 5198], ["FY23", 12765, 7356], ["FY24", 16434, 8306], ["FY25", 19177, 12188], ["FY26", 21420, 13050]]),
    peers: [{ name: "BSE Ltd", listed: true, metric: "P/E 58x" }, { name: "MCX", listed: true, metric: "P/E 49x" }, { name: "CDSL", listed: true, metric: "P/E 62x" }],
    documents: docs("NSE"),
    prices: [price("current_indicative", 1750, "2026-09-20", "RFIN desk"), price("secondary_trade", 1720, "2026-09-12", "Verified secondary trade")],
    bid_ask: { bid: 1735 * L, ask: 1765 * L },
    min_lot: 50, available: true, is_new_supply: false,
    risks: ["Unlisted: no exchange liquidity", "IPO timing uncertain", "Regulatory changes to derivatives trading"],
    transfer_restrictions: ["Transfer via off-market demat only", "Lock-in may apply post-IPO"],
  },
  {
    id: "zepto", name: "Zepto", sector: "Consumer Internet", themes: ["Quick commerce", "Pre-IPO"],
    summary: "10-minute grocery delivery across Indian metros.", founded: 2021, hq: "Mumbai",
    business: { model: "Dark-store quick commerce: groceries and essentials delivered in minutes, monetised via margins, ads and fees.", segments: ["Groceries", "Cafe", "Advertising"], moat: "Dense dark-store network in top metros." },
    financials: fin([["FY22", 142, -390], ["FY23", 2025, -1272], ["FY24", 4454, -1249], ["FY25", 11110, -1100], ["FY26", 18400, -620]]),
    peers: [{ name: "Swiggy Instamart", listed: true, metric: "EV/Sales 5.1x" }, { name: "Blinkit (Eternal)", listed: true, metric: "EV/Sales 7.4x" }],
    documents: docs("Zepto"),
    prices: [price("current_indicative", 520, "2026-09-18", "RFIN desk"), price("latest_funding_round", 480, "2025-11-01", "Series G")],
    min_lot: 100, available: true, is_new_supply: true,
    risks: ["Loss-making", "Valuation based on private rounds", "High concentration risk", "Intense competition"],
    transfer_restrictions: ["ROFR applies — company may block transfer", "Board approval required"],
  },
  {
    id: "hdb", name: "HDB Financial Services", sector: "Financial Services", themes: ["NBFC"],
    summary: "Retail-focused NBFC subsidiary of a large private bank.", founded: 2007, hq: "Mumbai",
    business: { model: "Lends to consumers and small businesses — consumer durables, vehicles, business loans.", segments: ["Consumer finance", "Enterprise lending", "Asset finance"], moat: "Parent bank's distribution and funding costs." },
    financials: fin([["FY22", 11306, 1011], ["FY23", 12403, 1959], ["FY24", 14171, 2461], ["FY25", 16300, 2176], ["FY26", 18200, 2410]]),
    peers: [{ name: "Bajaj Finance", listed: true, metric: "P/B 5.8x" }, { name: "Cholamandalam", listed: true, metric: "P/B 4.9x" }],
    documents: docs("HDB Financial"),
    prices: [price("indicative_mark", 1010, "2026-09-01", "RFIN valuation mark")],
    min_lot: 25, available: false, is_new_supply: false,
    risks: ["Credit-cycle exposure", "Asset-quality risk in unsecured loans"],
    transfer_restrictions: ["Off-market demat transfer"],
  },
  {
    id: "phonepe", name: "PhonePe", sector: "Fintech", themes: ["Payments", "Pre-IPO"],
    summary: "India's largest UPI payments app, expanding into lending and insurance distribution.", founded: 2015, hq: "Bengaluru",
    business: { model: "UPI payments at zero MDR; monetises through merchant services, lending and insurance distribution.", segments: ["Payments", "Merchant services", "Financial services distribution"], moat: "Leading UPI market share and merchant footprint." },
    financials: fin([["FY22", 1646, -2014], ["FY23", 2914, -2795], ["FY24", 5064, -1996], ["FY25", 7115, -1210], ["FY26", 9480, 190]]),
    peers: [{ name: "Paytm (One97)", listed: true, metric: "EV/Sales 6.2x" }, { name: "PB Fintech", listed: true, metric: "EV/Sales 11x" }],
    documents: docs("PhonePe"),
    prices: [price("current_indicative", 1480, "2026-09-15", "RFIN desk"), price("latest_funding_round", 1320, "2025-07-01", "Growth round")],
    bid_ask: { bid: 1460 * L, ask: 1500 * L },
    min_lot: 20, available: true, is_new_supply: true,
    risks: ["UPI market-share caps under discussion", "Monetisation depends on non-payment products"],
    transfer_restrictions: ["ROFR applies", "Company consent required for transfer"],
  },
  {
    id: "boat", name: "boAt", sector: "Consumer Electronics", themes: ["D2C brands"],
    summary: "Audio and wearables brand built on direct-to-consumer and marketplace sales.", founded: 2016, hq: "New Delhi",
    business: { model: "Designs and sells audio devices and smart wearables; contract-manufactured, sold online and offline.", segments: ["Audio", "Wearables", "Offline retail"], moat: "Brand recall and price-value positioning." },
    financials: fin([["FY22", 2873, 69], ["FY23", 3377, -129], ["FY24", 3118, -79], ["FY25", 3250, 42], ["FY26", 3600, 95]]),
    peers: [{ name: "Noise", listed: false, metric: "Private" }, { name: "Dixon (supplier)", listed: true, metric: "P/E 110x" }],
    documents: docs("boAt"),
    prices: [price("current_indicative", 1240, "2026-09-10", "RFIN desk"), price("secondary_trade", 1195, "2026-08-28", "Verified secondary trade")],
    min_lot: 30, available: true, is_new_supply: false,
    risks: ["Thin margins", "Competition from cheaper brands", "Import dependence"],
    transfer_restrictions: ["Off-market demat transfer"],
  },
  {
    id: "ather", name: "Ather Energy", sector: "Electric Vehicles", themes: ["EV", "Pre-IPO"],
    summary: "Premium electric scooters with its own software and fast-charging grid.", founded: 2013, hq: "Bengaluru",
    business: { model: "Designs and makes electric scooters; earns on vehicles, software subscriptions and charging.", segments: ["Scooters", "Software & services", "Charging grid"], moat: "Integrated hardware–software stack and charging network." },
    financials: fin([["FY22", 408, -344], ["FY23", 1781, -864], ["FY24", 1754, -1060], ["FY25", 2255, -812], ["FY26", 2980, -540]]),
    peers: [{ name: "TVS Motor", listed: true, metric: "P/E 58x" }, { name: "Bajaj Auto", listed: true, metric: "P/E 32x" }],
    documents: docs("Ather Energy"),
    prices: [price("indicative_mark", 355, "2026-09-05", "RFIN valuation mark"), price("latest_funding_round", 330, "2025-06-01", "Series H")],
    min_lot: 100, available: true, is_new_supply: false,
    risks: ["Loss-making", "Subsidy dependence", "Battery supply chain"],
    transfer_restrictions: ["ROFR applies", "Board approval required"],
  },
];

const draws = [
  {
    id: "festive-26", name: "Festive Lucky Draw", threshold: 3, draw_date: "2026-11-15", prize: "Gift cards worth ₹50,000",
    terms: "Three eligible transactions between 1 Sep and 31 Oct 2026. One entry per customer. Winners picked at random by an independent auditor.", active: true, results: null,
  },
  {
    id: "monsoon-26", name: "Monsoon Draw", threshold: 2, draw_date: "2026-08-15", prize: "Five gift cards worth ₹10,000 each",
    terms: "Two eligible transactions between 1 Jun and 31 Jul 2026. One entry per customer.", active: false,
    results: { drawnAt: "2026-08-15T12:00:00.000Z", winners: [{ entryId: "LD-MNS1A", prize: "₹10,000 gift card" }, { entryId: "LD-MNS7K", prize: "₹10,000 gift card" }, { entryId: "LD-MNS3Q", prize: "₹10,000 gift card" }, { entryId: "LD-MNS9T", prize: "₹10,000 gift card" }, { entryId: "LD-MNS2W", prize: "₹10,000 gift card" }] },
  },
];

// Existing account for sign-in testing: skips onboarding.
// Holds NSE + Zepto and has the seller role, so buy and sell can both be tried.
const DEMO = { financial: { incomeBand: "₹15–50 L", risk: "moderate", horizon: "3–7 years", liquidity: "medium", investible: 3_00_000 * L }, phone: "9876543210", rfin_id: "RFIN-7K2Q9", own_code: "RF-AARAV1", name: "Aarav Mehta", email: "aarav@example.com", city: "Mumbai", needs: ["grow_wealth", "protect_family", "sell_asset"], roles: ["buyer", "seller"], onboarded: true };

module.exports = {
  async up() {
    await db.sequelize.transaction(async (transaction) => {
      for (const p of products) await db.rfinProduct.upsert(p, { transaction });
      for (const c of companies) await db.rfinCompany.upsert(c, { transaction });
      for (const d of draws) await db.rfinLuckyDraw.upsert(d, { transaction });
      const [demo, created] = await db.rfinCustomer.findOrCreate({ where: { phone: DEMO.phone }, defaults: DEMO, transaction });
      if (created) {
        await provisionCustomer(demo, transaction);
        await db.rfinHolding.bulkCreate(
          [
            { customer_id: demo.id, company_id: "nse", quantity: 100, avg_cost: 1500 * L },
            { customer_id: demo.id, company_id: "zepto", quantity: 200, avg_cost: 455 * L },
          ],
          { transaction },
        );
        await db.rfinLuckyDrawEntry.create({ customer_id: demo.id, draw_id: "monsoon-26", progress: 2, state: "result", entry_id: "LD-MNS4D" }, { transaction });
        // Customer 360: something held elsewhere, a family, a goal that's behind.
        await db.rfinExistingProduct.create({ customer_id: demo.id, kind: "investment", name: "Nifty 50 index fund", provider: "Other AMC", value: 4_20_000 * L }, { transaction });
        await db.rfinFamilyMember.bulkCreate(
          [
            { customer_id: demo.id, name: "Kavya", relation: "spouse", birth_year: 1993, dependent: true, cover: { health: false, life: false } },
            { customer_id: demo.id, name: "Vihaan", relation: "child", birth_year: 2021, dependent: true, cover: { health: false, life: false } },
          ],
          { transaction },
        );
        const goal = await db.rfinGoal.create(
          { customer_id: demo.id, need: "save_plan", title: "Vihaan's education", target: 25_00_000 * L, target_date: "2036-06-01", contributions: [{ at: "2026-03-01T00:00:00.000Z", amount: 50_000 * L }] },
          { transaction },
        );
        // Started a year ago, so it's measurably behind schedule.
        await db.sequelize.query(`UPDATE "${db.rfinGoal.getTableName().schema}".goals SET "createdAt" = now() - interval '12 months' WHERE id = ${goal.id}`, { transaction });
      }
    });
  },

  async down() {
    await db.rfinCustomer.destroy({ where: { phone: DEMO.phone } });
    await db.rfinLuckyDraw.destroy({ where: { id: draws.map((d) => d.id) } });
    await db.rfinCompany.destroy({ where: { id: companies.map((c) => c.id) } });
    await db.rfinProduct.destroy({ where: { id: products.map((p) => p.id) } });
  },
};
