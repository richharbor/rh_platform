// Time-driven progression. Instead of in-memory timers (lost on restart), each
// record stores when its next "provider response" is due; reads call advance*()
// which applies every transition whose time has passed and saves it. Survives
// restarts, and every client sees the same state.
const db = require("../../models");
const { TIMING } = require("../../constants/rfin");

const now = () => new Date();
const stamp = (label, actor, extra = {}) => ({ at: now().toISOString(), label, done: true, actor, ...extra });
const later = (ms) => new Date(Date.now() + ms);

/** First eligible transaction: unlock points, move lucky-draw progress (report #54, #61, #63). */
async function onEligibleTransaction(customerId, transaction) {
  const { rfinPointEntry: Point, rfinLuckyDrawEntry: Entry, rfinLuckyDraw: Draw } = db;
  await Point.update({ state: "eligible" }, { where: { customer_id: customerId, state: "locked" }, transaction });
  const entries = await Entry.findAll({ where: { customer_id: customerId }, include: [{ model: Draw, as: "draw" }], transaction });
  for (const e of entries) {
    if (e.state !== "progress") continue;
    e.progress += 1;
    if (e.progress >= e.draw.threshold) {
      e.state = "entry_confirmed";
      e.entry_id = `LD-${Date.now().toString(36).toUpperCase()}`;
    }
    await e.save({ transaction });
  }
}

async function advanceOrder(order) {
  let changed = false;
  while (order.next_at && order.next_at <= now()) {
    changed = true;
    // Chain from when this step was due, not from when it was read, so an
    // order nobody polled still finishes on schedule.
    const due = new Date(order.next_at);
    const after = (ms) => new Date(due.getTime() + ms);
    const timeline = [...order.timeline];
    const paying = order.payment != null;
    if (order.state === "submitted") {
      order.state = "processing";
      if (!paying) {
        timeline.push(stamp("Documents checked", "rfin"));
        order.next_at = after(TIMING.fulfilMs);
      } else if (order.fail_payment) {
        order.payment = "failed";
        order.state = "action_required";
        order.action = { label: "Retry payment", route: `/order/${order.id}`, reason: "Your bank declined the payment. No money was taken." };
        timeline.push(stamp("Payment failed", "rfin", { failed: true }));
        order.next_at = null;
      } else {
        order.payment = "success";
        timeline.push(stamp("Payment received", "rfin"));
        order.next_at = after(TIMING.fulfilMs);
      }
    } else if (order.state === "processing") {
      order.state = "fulfilled";
      timeline.push(stamp(paying ? "Completed" : "Approved by provider", "provider"));
      order.next_at = null;
      await onEligibleTransaction(order.customer_id);
    } else {
      order.next_at = null;
    }
    order.timeline = timeline;
  }
  if (changed) await order.save();
  return order;
}

async function advanceKyc(items) {
  for (const k of items) {
    if (k.state === "in_progress" && k.review_until && k.review_until <= now()) {
      if (/blur/i.test(k.file_name || "")) {
        k.state = "action_required";
        k.rejection_reason = "Still hard to read. Take the photo in daylight with all four corners visible.";
      } else {
        k.state = "verified";
        k.rejection_reason = null;
      }
      k.review_until = null;
      await k.save();
    }
  }
  return items;
}

async function advanceBanks(banks) {
  for (const b of banks) {
    if (b.state === "verifying" && b.verify_at && b.verify_at <= now()) {
      if (b.will_fail) {
        b.state = "failed";
        b.failure_reason = "The bank couldn't find this account. Check the number and IFSC.";
      } else {
        b.state = "verified";
        await db.rfinKycItem.update({ state: "verified" }, { where: { customer_id: b.customer_id, item_key: "bank" } });
      }
      b.verify_at = null;
      await b.save();
    }
  }
  return banks;
}

module.exports = { advanceOrder, advanceKyc, advanceBanks, stamp, later };
