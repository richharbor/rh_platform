const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");
const { FAQS, advanceTicket } = require("../../service/rfin/support");
const { later } = require("../../service/rfin/progress");

const REPLY_MS = 5000;
const CONTEXTS = ["order", "kyc", "product", "company", "listing", "general"];
const ticketId = () => `SR-${Math.floor(10000 + Math.random() * 89999)}`;

// GET /rfin/support/faqs
const listFaqs = (req, res) => res.json(FAQS);

// GET /rfin/support/tickets
const listTickets = asyncWrapper(async (req, res) => {
  const rows = await db.rfinSupportTicket.findAll({ where: { customer_id: req.customer.id }, order: [["updatedAt", "DESC"]] });
  const fresh = [];
  for (const t of rows) fresh.push(await advanceTicket(t));
  res.json(fresh.map(serialize.ticket));
});

// GET /rfin/support/tickets/:id
const getTicket = asyncWrapper(async (req, res) => {
  const t = await db.rfinSupportTicket.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!t) return res.status(404).json({ error: "Ticket not found" });
  res.json(serialize.ticket(await advanceTicket(t)));
});

// POST /rfin/support/tickets { subject, message, contextType?, contextId? }
// Context comes from wherever the customer tapped "Talk to a human" (report #47).
const createTicket = asyncWrapper(async (req, res) => {
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();
  const contextType = CONTEXTS.includes(req.body.contextType) ? req.body.contextType : "general";
  if (subject.length < 3) return res.status(400).json({ error: "Add a short subject" });
  if (message.length < 2) return res.status(400).json({ error: "Tell us what you need help with" });
  const t = await db.rfinSupportTicket.create({
    id: ticketId(),
    customer_id: req.customer.id,
    subject: subject.slice(0, 200),
    context_type: contextType,
    context_id: req.body.contextId ? String(req.body.contextId).slice(0, 64) : null,
    messages: [{ at: new Date().toISOString(), from: "you", text: message.slice(0, 2000) }],
    reply_at: later(REPLY_MS),
  });
  res.status(201).json(serialize.ticket(t));
});

// POST /rfin/support/tickets/:id/messages { text }
const reply = asyncWrapper(async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Message can't be empty" });
  const t = await db.rfinSupportTicket.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!t) return res.status(404).json({ error: "Ticket not found" });
  if (t.state === "resolved") return res.status(409).json({ error: "This ticket is closed. Open a new one." });
  t.messages = [...t.messages, { at: new Date().toISOString(), from: "you", text: text.slice(0, 2000) }];
  t.state = "open";
  t.reply_at = later(REPLY_MS);
  await t.save();
  res.json(serialize.ticket(t));
});

// POST /rfin/support/tickets/:id/resolve
const resolve = asyncWrapper(async (req, res) => {
  const t = await db.rfinSupportTicket.findOne({ where: { id: req.params.id, customer_id: req.customer.id } });
  if (!t) return res.status(404).json({ error: "Ticket not found" });
  Object.assign(t, { state: "resolved", reply_at: null });
  await t.save();
  res.json(serialize.ticket(t));
});

module.exports = { listFaqs, listTickets, getTicket, createTicket, reply, resolve };
