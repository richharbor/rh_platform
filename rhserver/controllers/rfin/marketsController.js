const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");
const { advanceListing, stamp, later } = require("../../service/rfin/progress");
const { TIMING } = require("../../constants/rfin");
const { pmQuote } = require("./orderController");

const listingId = () => `SL-${Math.floor(10000 + Math.random() * 89999)}`;

// GET /rfin/companies/:id/quote?quantity — the buy review numbers (report #92).
const quote = asyncWrapper(async (req, res) => {
  const c = await db.rfinCompany.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: "Company not found" });
  const quantity = Number(req.query.quantity) || c.min_lot;
  if (quantity < c.min_lot || quantity % c.min_lot) return res.status(400).json({ error: `Buy in lots of ${c.min_lot} shares` });
  res.json({ ...pmQuote(serialize.indicativePrice(c), quantity), minLot: c.min_lot, settlement: "T+2 to T+5 working days after payment" });
});

// GET /rfin/companies/:id/price-discovery — evidence for sellers (report #93).
const priceDiscovery = asyncWrapper(async (req, res) => {
  const c = await db.rfinCompany.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: "Company not found" });
  const interest = await db.rfinWatchlist.count({ where: { company_id: c.id } });
  res.json({
    prices: c.prices,
    bidAsk: c.bid_ask || undefined,
    buyerInterest: 3 + interest, // watchers + desk demand
    transferRestrictions: c.transfer_restrictions,
    note: "Indicative. The final price is agreed with a matched buyer and needs company approval.",
  });
});

// GET /rfin/watchlist
const listWatchlist = asyncWrapper(async (req, res) => {
  const rows = await db.rfinWatchlist.findAll({ where: { customer_id: req.customer.id }, include: [{ model: db.rfinCompany, as: "company" }], order: [["createdAt", "DESC"]] });
  res.json(rows.map((w) => serialize.company(w.company)));
});

// PUT /rfin/watchlist/:companyId · DELETE /rfin/watchlist/:companyId
const watch = asyncWrapper(async (req, res) => {
  const c = await db.rfinCompany.findByPk(req.params.companyId);
  if (!c) return res.status(404).json({ error: "Company not found" });
  await db.rfinWatchlist.findOrCreate({ where: { customer_id: req.customer.id, company_id: c.id } });
  res.json({ watching: true });
});
const unwatch = asyncWrapper(async (req, res) => {
  await db.rfinWatchlist.destroy({ where: { customer_id: req.customer.id, company_id: req.params.companyId } });
  res.json({ watching: false });
});

// GET /rfin/portfolio — holdings with indicative vs realised gain, concentration (report #94).
const portfolio = asyncWrapper(async (req, res) => {
  const rows = await db.rfinHolding.findAll({ where: { customer_id: req.customer.id }, include: [{ model: db.rfinCompany, as: "company" }], order: [["createdAt", "ASC"]] });
  const holdings = rows.filter((h) => h.quantity > 0 || Number(h.realized_gain)).map(serialize.holding);
  const value = holdings.reduce((s, h) => s + h.indicativeValue, 0);
  const cost = holdings.reduce((s, h) => s + h.costBasis, 0);
  const bySector = {};
  for (const h of holdings) bySector[h.sector] = (bySector[h.sector] || 0) + h.indicativeValue;
  res.json({
    holdings,
    totals: { indicativeValue: value, costBasis: cost, indicativeGain: value - cost, realizedGain: holdings.reduce((s, h) => s + h.realizedGain, 0) },
    sectors: Object.entries(bySector).map(([sector, v]) => ({ sector, pct: value ? Math.round((v / value) * 100) : 0 })).sort((a, b) => b.pct - a.pct),
  });
});

// GET /rfin/sell-listings
const listListings = asyncWrapper(async (req, res) => {
  const rows = await db.rfinSellListing.findAll({ where: { customer_id: req.customer.id }, order: [["createdAt", "DESC"]] });
  const fresh = [];
  for (const l of rows) fresh.push(await advanceListing(l));
  const names = Object.fromEntries((await db.rfinCompany.findAll({ attributes: ["id", "name"] })).map((c) => [c.id, c.name]));
  res.json(fresh.map((l) => ({ ...serialize.listing(l), companyName: names[l.company_id] })));
});

// GET /rfin/sell-listings/:id
const getListing = asyncWrapper(async (req, res) => {
  const l = await db.rfinSellListing.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!l) return res.status(404).json({ error: "Listing not found" });
  const fresh = await advanceListing(l);
  const c = await db.rfinCompany.findByPk(fresh.company_id);
  res.json({ ...serialize.listing(fresh), companyName: c && c.name });
});

// POST /rfin/sell-listings { companyId, quantity, ask } — reserves the shares.
const createListing = asyncWrapper(async (req, res) => {
  const { companyId } = req.body;
  const quantity = Number(req.body.quantity);
  const ask = Math.round(Number(req.body.ask));
  const c = companyId && (await db.rfinCompany.findByPk(companyId));
  if (!c) return res.status(404).json({ error: "Company not found" });
  if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ error: "Enter how many shares to sell" });
  if (!(ask > 0)) return res.status(400).json({ error: "Enter your asking price per share" });

  const result = await db.sequelize.transaction(async (transaction) => {
    const h = await db.rfinHolding.findOne({ where: { customer_id: req.customer.id, company_id: c.id }, transaction, lock: transaction.LOCK.UPDATE });
    const free = h ? h.quantity - h.reserved : 0;
    if (quantity > free) return { error: free ? `You can list up to ${free} shares` : `You don't hold ${c.name} on RFIN` };
    h.reserved += quantity;
    await h.save({ transaction });
    return db.rfinSellListing.create(
      {
        id: listingId(),
        customer_id: req.customer.id,
        company_id: c.id,
        quantity,
        ask,
        state: "verifying",
        timeline: [stamp(`Listed ${quantity} shares at ₹${Math.round(ask / 100).toLocaleString("en-IN")}`, "you")],
        next_at: later(TIMING.listingStepMs),
      },
      { transaction },
    );
  });
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ ...serialize.listing(result), companyName: c.name });
});

// POST /rfin/sell-listings/:id/cancel — only before a buyer is matched.
const cancelListing = asyncWrapper(async (req, res) => {
  const out = await db.sequelize.transaction(async (transaction) => {
    const l = await db.rfinSellListing.findOne({ where: { id: req.params.id, customer_id: req.customer.id }, transaction, lock: transaction.LOCK.UPDATE });
    if (!l) return { status: 404, error: "Listing not found" };
    if (!["verifying", "listed"].includes(l.state)) return { status: 409, error: "A buyer is already matched — this can't be cancelled now" };
    const h = await db.rfinHolding.findOne({ where: { customer_id: l.customer_id, company_id: l.company_id }, transaction, lock: transaction.LOCK.UPDATE });
    if (h) {
      h.reserved -= l.quantity;
      await h.save({ transaction });
    }
    Object.assign(l, { state: "cancelled", next_at: null, timeline: [...l.timeline, stamp("Listing cancelled", "you")] });
    await l.save({ transaction });
    return { listing: l };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json(serialize.listing(out.listing));
});

module.exports = { quote, priceDiscovery, listWatchlist, watch, unwatch, portfolio, listListings, getListing, createListing, cancelListing };
