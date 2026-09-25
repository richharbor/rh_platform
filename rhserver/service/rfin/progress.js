// Time-driven progression. Each record stores when its next "provider response"
// is due; reads call advance*(), which applies every transition whose time has
// passed and saves it. Survives restarts, and every client sees the same state.
//
// Every advance runs inside a transaction holding a row lock and re-checks the
// row, so two concurrent reads (an order screen and the list polling at once)
// can never apply the same transition — or send the same notification — twice.
const db = require("../../models");
const { TIMING, REWARDS, PARTNER } = require("../../constants/rfin");
const { notify } = require("./notify");

const now = () => new Date();
const stamp = (label, actor, extra = {}) => ({ at: now().toISOString(), label, done: true, actor, ...extra });
const later = (ms) => new Date(Date.now() + ms);
const due = (at) => at && new Date(at) <= now();
const inr = (paise) => `₹${Math.round(Number(paise) / 100).toLocaleString("en-IN")}`;
const code = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/** Re-read `id` with a row lock and run `fn` on the fresh copy inside one transaction. */
function withLock(Model, id, fn) {
  return db.sequelize.transaction(async (transaction) => {
    const row = await Model.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (row) await fn(row, transaction);
    return row;
  });
}

// ── Effects of a completed order ─────────────────────────────────────────

/** Documents a completed order produces (report #40, #46). */
async function issueDocuments(order, transaction) {
  const docs = [];
  if (order.kind === "pm_buy") {
    docs.push({ kind: "statement", title: `${order.title} — transfer confirmation (${order.quantity} shares)` });
  } else {
    const product = await db.rfinProduct.findByPk(order.subject_id, { transaction });
    if (product && product.category === "insurance") docs.push({ kind: "policy", title: `${order.title} — policy document` });
    if (product && product.category === "loans") docs.push({ kind: "sanction", title: `${order.title} — sanction letter` });
    if (product && product.category === "investments") docs.push({ kind: "statement", title: `${order.title} — allotment statement` });
  }
  if (order.payment === "success") docs.push({ kind: "receipt", title: `Payment receipt · ${order.id}` });
  await db.rfinDocument.bulkCreate(
    docs.map((d) => ({ ...d, customer_id: order.customer_id, order_id: order.id, state: "available", file_name: `${order.id}-${d.kind}.pdf` })),
    { transaction },
  );
}

/** Shares land in the portfolio (report #92 "→ Portfolio"). */
async function creditHolding(order, transaction) {
  const [h] = await db.rfinHolding.findOrCreate({
    where: { customer_id: order.customer_id, company_id: order.subject_id },
    defaults: { quantity: 0, avg_cost: order.unit_price },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const qty = h.quantity + order.quantity;
  h.avg_cost = Math.round((h.quantity * Number(h.avg_cost) + order.quantity * Number(order.unit_price)) / qty);
  h.quantity = qty;
  await h.save({ transaction });
}

/**
 * An eligible transaction completed (report #54, #55, #61, #63, #67):
 * welcome points unlock, transaction points are earned, the first one issues a
 * gift card, lucky-draw progress moves, and whoever referred this customer is approved.
 */
async function onEligibleTransaction(customerId, order, transaction) {
  const { rfinPointEntry: Point, rfinLuckyDrawEntry: Entry, rfinLuckyDraw: Draw, rfinBenefit: Benefit, rfinReferral: Referral } = db;

  const [unlocked] = await Point.update({ state: "eligible" }, { where: { customer_id: customerId, state: "locked" }, transaction });
  if (unlocked) await notify(customerId, { category: "rewards", tone: "success", title: "Welcome points unlocked", body: "Your first transaction unlocked 1,000 RFIN Points.", route: "/rewards" }, transaction);

  await Point.create({ customer_id: customerId, description: `Transaction reward · ${order.title}`, points: REWARDS.transactionPoints, state: "eligible", ref: order.id }, { transaction });

  if (!(await Benefit.count({ where: { customer_id: customerId, source: "first_txn" }, transaction }))) {
    const b = REWARDS.firstTransactionBenefit;
    await Benefit.create(
      { customer_id: customerId, kind: "gift_card", title: b.title, issuer: b.issuer, value: b.value, state: "processing", terms: b.terms, source: "first_txn", source_ref: order.id, ready_at: later(TIMING.benefitReadyMs) },
      { transaction },
    );
    await notify(customerId, { category: "rewards", tone: "pending", title: `${inr(b.value)} ${b.title.toLowerCase()} unlocked`, body: "It's being issued — usually ready in a few seconds.", route: "/rewards" }, transaction);
  }

  // Lock only the entry rows — Postgres refuses FOR UPDATE on the joined draw.
  const entries = await Entry.findAll({ where: { customer_id: customerId }, include: [{ model: Draw, as: "draw", required: true }], transaction, lock: { level: transaction.LOCK.UPDATE, of: Entry } });
  for (const e of entries) {
    if (e.state !== "progress" || !e.draw.active) continue;
    e.progress += 1;
    if (e.progress >= e.draw.threshold) {
      e.state = "entry_confirmed";
      e.entry_id = `LD-${Date.now().toString(36).toUpperCase()}`;
      await notify(customerId, { category: "rewards", tone: "success", title: `You're in the ${e.draw.name}`, body: `Entry ${e.entry_id} · draw on ${e.draw.draw_date}.`, route: `/rewards/draw/${e.draw.id}` }, transaction);
    } else {
      const left = e.draw.threshold - e.progress;
      await notify(customerId, { category: "rewards", tone: "pending", title: `${e.draw.name}: ${e.progress}/${e.draw.threshold}`, body: `${left} more eligible transaction${left > 1 ? "s" : ""} to enter.`, route: `/rewards/draw/${e.draw.id}` }, transaction);
    }
    await e.save({ transaction });
  }

  const ref = await Referral.findOne({ where: { referee_id: customerId, state: "pending" }, transaction, lock: transaction.LOCK.UPDATE });
  if (ref) {
    Object.assign(ref, { state: "approved", next_at: later(TIMING.referralPayMs) });
    await ref.save({ transaction });
    await notify(ref.referrer_id, { category: "rewards", tone: "success", title: `${ref.invitee_name}'s referral approved`, body: `${inr(ref.reward)} is on its way.`, route: "/refer" }, transaction);
  }
}

// ── Orders ───────────────────────────────────────────────────────────────

async function advanceOrder(order) {
  if (!due(order.next_at)) return order;
  return withLock(db.rfinOrder, order.id, async (o, transaction) => {
    let changed = false;
    while (due(o.next_at)) {
      changed = true;
      // Chain from when this step was due, not from when it was read.
      const was = new Date(o.next_at);
      const after = (ms) => new Date(was.getTime() + ms);
      const timeline = [...o.timeline];
      const paying = o.payment != null;
      const pm = o.kind === "pm_buy";
      if (o.state === "submitted") {
        o.state = "processing";
        if (!paying) {
          timeline.push(stamp("Documents checked", "rfin"));
          o.next_at = after(TIMING.fulfilMs);
        } else if (o.fail_payment) {
          o.payment = "failed";
          o.state = "action_required";
          o.action = { type: "retry_payment", label: "Retry payment", route: `/order/${o.id}`, reason: "Your bank declined the payment. No money was taken." };
          timeline.push(stamp("Payment failed", "rfin", { failed: true }));
          o.next_at = null;
          await notify(o.customer_id, { category: "payments", tone: "action", title: "Payment didn't go through", body: `${o.title} · No money was taken. Retry anytime.`, route: `/order/${o.id}` }, transaction);
        } else {
          o.payment = "success";
          timeline.push(stamp("Payment received", "rfin"));
          if (pm) timeline.push(stamp("Transfer initiated with the seller", "rfin"));
          o.next_at = after(TIMING.fulfilMs);
          await notify(o.customer_id, { category: "payments", tone: "success", title: "Payment received", body: `${o.title} · ${inr(o.amount)}`, route: `/order/${o.id}` }, transaction);
        }
      } else if (o.state === "processing") {
        o.state = "fulfilled";
        o.action = null;
        timeline.push(stamp(pm ? `${o.quantity} shares credited to your demat` : paying ? "Completed" : "Approved by provider", "provider"));
        o.next_at = null;
        if (pm) await creditHolding(o, transaction);
        await issueDocuments(o, transaction);
        await notify(o.customer_id, { category: "applications", tone: "success", title: pm ? `${o.quantity} ${o.title} shares are yours` : `${o.title} is confirmed`, body: pm ? "They're in your portfolio now." : "Your documents are ready in Documents.", route: pm ? "/portfolio" : `/order/${o.id}` }, transaction);
        await onEligibleTransaction(o.customer_id, o, transaction);
      } else {
        o.next_at = null;
      }
      o.timeline = timeline;
    }
    if (changed) await o.save({ transaction });
  });
}

// ── KYC, bank ────────────────────────────────────────────────────────────

async function advanceKyc(items) {
  const out = [];
  for (const item of items) {
    if (item.state !== "in_progress" || !due(item.review_until)) {
      out.push(item);
      continue;
    }
    out.push(
      await withLock(db.rfinKycItem, item.id, async (k, transaction) => {
        if (k.state !== "in_progress" || !due(k.review_until)) return;
        const rejected = /blur/i.test(k.file_name || "");
        Object.assign(k, {
          state: rejected ? "action_required" : "verified",
          rejection_reason: rejected ? "Still hard to read. Take the photo in daylight with all four corners visible." : null,
          review_until: null,
        });
        await k.save({ transaction });
        await db.rfinDocument.update({ state: rejected ? "requested" : "available" }, { where: { customer_id: k.customer_id, kyc_item: k.item_key, state: "in_review" }, transaction });
        await notify(
          k.customer_id,
          rejected
            ? { category: "kyc", tone: "action", title: `${k.label} needs another look`, body: k.rejection_reason, route: `/kyc/upload/${k.item_key}` }
            : { category: "kyc", tone: "success", title: `${k.label} verified`, body: "You won't be asked for this again.", route: "/kyc" },
          transaction,
        );
      }),
    );
  }
  return out;
}

async function advanceBanks(banks) {
  const out = [];
  for (const bank of banks) {
    if (bank.state !== "verifying" || !due(bank.verify_at)) {
      out.push(bank);
      continue;
    }
    out.push(
      await withLock(db.rfinBankAccount, bank.id, async (b, transaction) => {
        if (b.state !== "verifying" || !due(b.verify_at)) return;
        if (b.will_fail) {
          Object.assign(b, { state: "failed", failure_reason: "The bank couldn't find this account. Check the number and IFSC.", verify_at: null });
          await notify(b.customer_id, { category: "kyc", tone: "action", title: "Bank account couldn't be verified", body: b.failure_reason, route: "/bank" }, transaction);
        } else {
          Object.assign(b, { state: "verified", verify_at: null });
          await db.rfinKycItem.update({ state: "verified" }, { where: { customer_id: b.customer_id, item_key: "bank" }, transaction });
          await notify(b.customer_id, { category: "kyc", tone: "success", title: `${b.bank} •••• ${b.last4} verified`, body: "Payouts and refunds will go here.", route: "/bank" }, transaction);
        }
        await b.save({ transaction });
      }),
    );
  }
  return out;
}

// ── Private-market sell listing (report #93) ─────────────────────────────
// verifying → listed → matched → approvals → transferring → paid

const LISTING_STEPS = {
  verifying: { next: "listed", label: "Holding verified in your demat", actor: "rfin" },
  listed: { next: "matched", label: "Buyer matched", actor: "rfin" },
  matched: { next: "approvals", label: "Company approval & ROFR cleared", actor: "provider" },
  approvals: { next: "transferring", label: "Share transfer initiated", actor: "rfin" },
  transferring: { next: "paid", label: "Proceeds paid to your bank", actor: "rfin" },
};

async function advanceListing(listing) {
  if (!due(listing.next_at)) return listing;
  return withLock(db.rfinSellListing, listing.id, async (l, transaction) => {
    let changed = false;
    while (due(l.next_at) && LISTING_STEPS[l.state]) {
      changed = true;
      const step = LISTING_STEPS[l.state];
      const was = new Date(l.next_at);
      const timeline = [...l.timeline, stamp(step.label, step.actor)];
      if (step.next === "listed") l.buyer_interest = 2 + Math.floor(Math.random() * 4);
      if (step.next === "matched") l.match_price = l.ask;
      l.state = step.next;
      l.next_at = step.next === "paid" ? null : new Date(was.getTime() + TIMING.listingStepMs);
      if (step.next === "paid") {
        l.proceeds = Number(l.match_price || l.ask) * l.quantity;
        const h = await db.rfinHolding.findOne({ where: { customer_id: l.customer_id, company_id: l.company_id }, transaction, lock: transaction.LOCK.UPDATE });
        if (h) {
          h.realized_gain = Number(h.realized_gain) + (Number(l.match_price || l.ask) - Number(h.avg_cost)) * l.quantity;
          h.quantity -= l.quantity;
          h.reserved -= l.quantity;
          await h.save({ transaction });
        }
        await notify(l.customer_id, { category: "payments", tone: "success", title: `${inr(l.proceeds)} paid for your shares`, body: `${l.quantity} shares sold · ${l.id}`, route: `/sell/${l.id}` }, transaction);
      } else if (step.next === "matched") {
        await notify(l.customer_id, { category: "applications", tone: "success", title: "A buyer matched your listing", body: `${l.quantity} shares at ${inr(l.match_price)} each. Approvals next.`, route: `/sell/${l.id}` }, transaction);
      }
      l.timeline = timeline;
    }
    if (changed) await l.save({ transaction });
  });
}

// ── Rewards ──────────────────────────────────────────────────────────────

async function advanceBenefit(benefit) {
  const ready = benefit.state === "processing" && due(benefit.ready_at);
  const expiring = ["ready", "partially_used"].includes(benefit.state) && due(benefit.expires_at);
  if (!ready && !expiring) return benefit;
  return withLock(db.rfinBenefit, benefit.id, async (b, transaction) => {
    if (b.state === "processing" && due(b.ready_at)) {
      const days = REWARDS.firstTransactionBenefit.validityDays;
      Object.assign(b, { state: "ready", code: code("RH"), ready_at: null, expires_at: new Date(Date.now() + days * 86400000) });
      await b.save({ transaction });
      await notify(b.customer_id, { category: "rewards", tone: "success", title: `Your ${inr(b.value)} ${b.title.toLowerCase()} is ready`, body: `Valid for ${days} days.`, route: `/rewards/benefit/${b.id}` }, transaction);
    } else if (["ready", "partially_used"].includes(b.state) && due(b.expires_at)) {
      b.state = "expired";
      await b.save({ transaction });
    }
  });
}

async function advanceReferral(referral) {
  if (referral.state !== "approved" || !due(referral.next_at)) return referral;
  return withLock(db.rfinReferral, referral.id, async (r, transaction) => {
    if (r.state !== "approved" || !due(r.next_at)) return;
    Object.assign(r, { state: "paid", next_at: null });
    await r.save({ transaction });
    await notify(r.referrer_id, { category: "rewards", tone: "success", title: `${inr(r.reward)} referral reward paid`, body: `Thanks for bringing ${r.invitee_name} to RFIN.`, route: "/refer" }, transaction);
  });
}

// ── Partner (step 7) ─────────────────────────────────────────────────────

/** Verification finished: Partner ID, partner role, starter book (report #79, #81). */
async function advanceProfile(profile) {
  if (profile.state !== "verifying" || !due(profile.verify_at)) return profile;
  return withLock(db.rfinPartnerProfile, profile.id, async (pp, transaction) => {
    if (pp.state !== "verifying" || !due(pp.verify_at)) return;
    const c = await db.rfinCustomer.findByPk(pp.customer_id, { transaction, lock: transaction.LOCK.UPDATE });
    Object.assign(pp, { state: "active", partner_code: code("RFP"), activated_at: now(), verify_at: null });
    await pp.save({ transaction });
    if (!c.roles.includes("partner")) {
      c.roles = [...c.roles, "partner"];
      await c.save({ transaction });
    }
    const { provisionPartnerBook } = require("./provision");
    await provisionPartnerBook(c, transaction);
    await notify(pp.customer_id, { category: "applications", tone: "success", title: "You're an RFIN partner", body: `Partner ID ${pp.partner_code}. Your dashboard is ready.`, route: "/partner/home" }, transaction);
  });
}

const STAGES = PARTNER.caseStages;

/** Case 360 progression; completing a case converts the lead and books commission (report #84, #86, #88). */
async function advanceCase(kase) {
  if (!due(kase.next_at)) return kase;
  return withLock(db.rfinCase, kase.id, async (k, transaction) => {
    let changed = false;
    while (due(k.next_at)) {
      changed = true;
      const i = STAGES.findIndex((st) => st.id === k.stage);
      const next = STAGES[i + 1];
      if (!next) {
        k.next_at = null;
        break;
      }
      const was = new Date(k.next_at);
      k.stage = next.id;
      k.next_action = next.next;
      k.timeline = [...k.timeline, stamp(next.label, next.id === "kyc_verified" ? "rfin" : "provider")];
      k.next_at = next.id === "completed" ? null : new Date(was.getTime() + TIMING.caseStepMs);
      if (next.id === "completed") {
        const lead = await db.rfinLead.findByPk(k.lead_id, { transaction, lock: transaction.LOCK.UPDATE });
        if (lead) {
          Object.assign(lead, { state: "converted", next_action: "Send the client their confirmation" });
          await lead.save({ transaction });
        }
        const amount = Math.round((Number(k.value) * PARTNER.commissionPct) / 100);
        await db.rfinCommission.create(
          { id: `CM-${Math.floor(10000 + Math.random() * 89999)}`, partner_id: k.partner_id, description: `${k.client} · ${k.subject}`, amount, state: "pending", case_id: k.id, available_at: later(TIMING.commissionAvailableMs) },
          { transaction },
        );
        await notify(k.partner_id, { category: "payments", tone: "success", title: `${k.client}'s case completed`, body: `${inr(amount)} commission is pending provider confirmation.`, route: `/partner/cases/${k.id}` }, transaction);
      }
    }
    if (changed) await k.save({ transaction });
  });
}

/** Pending commission becomes available once the provider confirms (report #89). */
async function advanceCommissions(rows) {
  const out = [];
  for (const row of rows) {
    if (row.state !== "pending" || !due(row.available_at)) {
      out.push(row);
      continue;
    }
    out.push(
      await withLock(db.rfinCommission, row.id, async (c, transaction) => {
        if (c.state !== "pending" || !due(c.available_at)) return;
        Object.assign(c, { state: "available", available_at: null });
        await c.save({ transaction });
      }),
    );
  }
  return out;
}

async function advancePayout(payout) {
  if (payout.state !== "processing" || !due(payout.next_at)) return payout;
  return withLock(db.rfinPayout, payout.id, async (p, transaction) => {
    if (p.state !== "processing" || !due(p.next_at)) return;
    Object.assign(p, { state: "paid", next_at: null });
    await p.save({ transaction });
    await db.rfinCommission.update({ state: "paid" }, { where: { id: p.commission_ids }, transaction });
    await notify(p.partner_id, { category: "payments", tone: "success", title: `${inr(p.net)} payout sent`, body: `${p.id} · ${inr(p.tds)} TDS deducted`, route: "/partner/earnings" }, transaction);
  });
}

module.exports = { advanceProfile, advanceCase, advanceCommissions, advancePayout, advanceOrder, advanceKyc, advanceBanks, advanceListing, advanceBenefit, advanceReferral, issueDocuments, stamp, later, withLock, inr };
