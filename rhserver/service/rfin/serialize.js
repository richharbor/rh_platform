// DB row → the exact shapes in rhserver/shared/rfin/src/models.ts.
// BIGINT columns come back from pg as strings; money is always a Number of paise.
const n = (v) => (v == null ? undefined : Number(v));
const iso = (d) => (d ? new Date(d).toISOString() : undefined);

const customer = (c, kycState = "not_started") => {
  const fields = [c.name, c.email, c.city, (c.needs || []).length ? "x" : null];
  return {
    rfinId: c.rfin_id,
    phone: c.phone,
    name: c.name || undefined,
    email: c.email || undefined,
    city: c.city || undefined,
    roles: c.roles,
    needs: c.needs,
    kyc: kycState,
    onboarded: c.onboarded,
    referralCode: c.own_code || undefined,
    profileCompleteness: Math.round((fields.filter(Boolean).length / fields.length) * 100),
  };
};

const product = (p) => ({
  id: p.id,
  category: p.category,
  name: p.name,
  provider: p.provider,
  tagline: p.tagline,
  whoFor: p.who_for,
  requirements: p.requirements,
  costs: p.costs,
  risks: p.risks,
  whatNext: p.what_next,
  minAmount: n(p.min_amount),
  transactable: p.transactable,
});

const company = (c) => ({
  id: c.id,
  name: c.name,
  sector: c.sector,
  themes: c.themes,
  summary: c.summary,
  prices: c.prices,
  minLot: c.min_lot,
  available: c.available,
  isNewSupply: c.is_new_supply,
  risks: c.risks,
  transferRestrictions: c.transfer_restrictions,
  founded: c.founded || undefined,
  hq: c.hq || undefined,
  business: c.business && c.business.model ? c.business : undefined,
  financials: c.financials,
  peers: c.peers,
  documents: c.documents,
  bidAsk: c.bid_ask || undefined,
});

const kycItem = (k) => ({ id: k.item_key, label: k.label, why: k.why, state: k.state, rejectionReason: k.rejection_reason || undefined });

const bank = (b) => ({
  id: `BK-${b.id}`,
  bank: b.bank,
  last4: b.last4,
  ifsc: b.ifsc,
  holder: b.holder,
  state: b.state,
  primary: b.primary,
  failureReason: b.failure_reason || undefined,
});

const order = (o) => ({
  id: o.id,
  kind: o.kind,
  subjectId: o.subject_id,
  title: o.title,
  state: o.state,
  payment: o.payment || undefined,
  amount: n(o.amount),
  createdAt: iso(o.createdAt),
  timeline: o.timeline,
  action: o.action || undefined,
  quantity: o.quantity || undefined,
  unitPrice: n(o.unit_price),
});

const point = (p) => ({ id: `PT-${p.id}`, ledger: "points", at: iso(p.createdAt), description: p.description, points: p.points, state: p.state, ref: p.ref || undefined });

const draw = (e) => ({
  results: e.draw.results || undefined,
  id: e.draw.id,
  name: e.draw.name,
  threshold: e.draw.threshold,
  progress: Math.min(e.progress, e.draw.threshold),
  state: e.state,
  drawDate: e.draw.draw_date,
  prize: e.draw.prize,
  entryId: e.entry_id || undefined,
  terms: e.draw.terms,
});

const lead = (l) => ({ id: l.id, client: l.client, need: l.need, productId: l.product_id || undefined, state: l.state, potential: n(l.potential), nextAction: l.next_action, updatedAt: iso(l.updatedAt) });

const commission = (c) => ({ id: c.id, ledger: "commission", at: iso(c.createdAt), description: c.description, amount: n(c.amount), state: c.state, caseId: c.case_id || undefined });

const consent = (c) => ({ id: `CN-${c.id}`, at: iso(c.createdAt), subject: c.subject, items: c.items });

const document = (d) => ({ id: `DOC-${d.id}`, kind: d.kind, title: d.title, state: d.state, orderId: d.order_id || undefined, kycItem: d.kyc_item || undefined, fileName: d.file_name || undefined, at: iso(d.createdAt) });

const notification = (x) => ({ id: x.id, category: x.category, title: x.title, body: x.body, route: x.route || undefined, tone: x.tone, read: !!x.read_at, at: iso(x.createdAt) });

const ticket = (t) => ({ id: t.id, subject: t.subject, contextType: t.context_type, contextId: t.context_id || undefined, state: t.state, messages: t.messages, updatedAt: iso(t.updatedAt), advisorTyping: !!t.reply_at });

const indicativePrice = (c) => {
  const p = (c.prices || []).find((x) => x.kind === "current_indicative") || (c.prices || [])[0];
  return p ? Number(p.perShare) : 0;
};

/** Holding with indicative (not realised) gain — the two are never merged (report #94). */
const holding = (h) => {
  const price = indicativePrice(h.company);
  const cost = Number(h.avg_cost) * h.quantity;
  const value = price * h.quantity;
  return {
    companyId: h.company_id,
    name: h.company.name,
    sector: h.company.sector,
    quantity: h.quantity,
    reserved: h.reserved,
    avgCost: Number(h.avg_cost),
    costBasis: cost,
    indicativePrice: price,
    indicativeValue: value,
    indicativeGain: value - cost,
    realizedGain: Number(h.realized_gain),
    priceKind: ((h.company.prices || []).find((x) => x.kind === "current_indicative") || (h.company.prices || [])[0] || {}).kind,
  };
};

const listing = (l) => ({
  id: l.id,
  companyId: l.company_id,
  companyName: l.company ? l.company.name : undefined,
  quantity: l.quantity,
  ask: Number(l.ask),
  state: l.state,
  timeline: l.timeline,
  buyerInterest: l.buyer_interest,
  matchPrice: n(l.match_price),
  proceeds: n(l.proceeds),
  createdAt: iso(l.createdAt),
});

const benefit = (b) => ({
  id: b.id,
  ledger: "benefits",
  kind: b.kind,
  title: b.title,
  issuer: b.issuer,
  value: Number(b.value),
  state: b.state,
  code: b.state === "ready" || b.state === "partially_used" ? b.code : undefined,
  terms: b.terms,
  source: b.source,
  sourceRef: b.source_ref || undefined,
  at: iso(b.createdAt),
  expiresAt: iso(b.expires_at),
  redeemedAt: iso(b.redeemed_at),
});

const referral = (r) => ({ id: r.id, need: r.need, inviteeName: r.invitee_name, state: r.state, reward: Number(r.reward), joined: !!r.referee_id, at: iso(r.createdAt), updatedAt: iso(r.updatedAt) });

module.exports = { holding, listing, benefit, referral, indicativePrice, document, notification, ticket, customer, product, company, kycItem, bank, order, point, draw, lead, commission, consent };
