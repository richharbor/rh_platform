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
});

const point = (p) => ({ id: `PT-${p.id}`, ledger: "points", at: iso(p.createdAt), description: p.description, points: p.points, state: p.state, ref: p.ref || undefined });

const draw = (e) => ({
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

module.exports = { customer, product, company, kycItem, bank, order, point, draw, lead, commission, consent };
