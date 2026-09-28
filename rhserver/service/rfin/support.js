// Mock advisor: replies once reply_at passes, using the ticket's context so the
// customer never has to explain it (report #47). Applied on read like progress.js.
const db = require("../../models");
const { notify } = require("./notify");

const FAQS = [
  { id: "indicative", q: "What does \"indicative\" mean?", a: "It's RFIN's estimate from the information we have. The provider confirms the final price, rate or eligibility after checking your documents." },
  { id: "kyc-once", q: "Why do you need my KYC?", a: "Regulation requires identity and address checks before any financial transaction. You do it once and it's reused for every product on RFIN." },
  { id: "payment-failed", q: "My payment failed. Was I charged?", a: "No. A failed payment never takes money. If your bank shows a debit, it's refunded automatically within 5–7 working days." },
  { id: "points", q: "Can I withdraw RFIN Points?", a: "No. Points aren't cash. They unlock benefits and never change a product's terms or risk." },
  { id: "grievance", q: "How do I raise a complaint?", a: "Open a ticket here and choose \"Escalate\". If it isn't resolved in 15 days you can approach the product's regulator." },
];

async function contextLine(t) {
  if (t.context_type === "order" && t.context_id) {
    const o = await db.rfinOrder.findOne({ where: { id: t.context_id, customer_id: t.customer_id } });
    if (o) return `I can see ${o.title} (${o.id}) is currently "${o.state.replace(/_/g, " ")}"${o.action ? ` and is waiting on: ${o.action.label.toLowerCase()}` : ""}.`;
  }
  if (t.context_type === "kyc" && t.context_id) {
    const k = await db.rfinKycItem.findOne({ where: { item_key: t.context_id, customer_id: t.customer_id } });
    if (k) return `I can see your ${k.label.toLowerCase()} is "${k.state.replace(/_/g, " ")}"${k.rejection_reason ? `: ${k.rejection_reason}` : ""}.`;
  }
  if (t.context_type === "company" && t.context_id) {
    const c = await db.rfinCompany.findByPk(t.context_id);
    if (c) return `You're asking about ${c.name} (${c.sector}).`;
  }
  if (t.context_type === "listing" && t.context_id) {
    const l = await db.rfinSellListing.findOne({ where: { id: t.context_id, customer_id: t.customer_id } });
    if (l) return `I can see your listing ${l.id} for ${l.quantity} shares is "${l.state}".`;
  }
  if (t.context_type === "product" && t.context_id) {
    const p = await db.rfinProduct.findByPk(t.context_id);
    if (p) return `You're asking about ${p.name} from ${p.provider}.`;
  }
  return "Thanks for reaching out.";
}

async function advanceTicket(ticket) {
  if (!ticket.reply_at || ticket.reply_at > new Date()) return ticket;
  // Locked like progress.js, so two polls can't post the reply twice.
  return db.sequelize.transaction(async (transaction) => {
    const t = await db.rfinSupportTicket.findByPk(ticket.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!t.reply_at || t.reply_at > new Date()) return t;
    const line = await contextLine(t);
    t.messages = [...t.messages, { at: new Date().toISOString(), from: "rfin", author: "Neha · RFIN advisor", text: `${line} I'll take it from here — reply with anything else you'd like me to check.` }];
    t.state = "awaiting_you";
    t.reply_at = null;
    await t.save({ transaction });
    await notify(t.customer_id, { category: "support", tone: "info", title: `Reply on ${t.id}`, body: t.subject, route: `/support/${t.id}` }, transaction);
    return t;
  });
}

module.exports = { FAQS, advanceTicket };
