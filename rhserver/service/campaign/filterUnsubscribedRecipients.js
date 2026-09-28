const { Op } = require("sequelize");
const { Unsubscribe } = require("../../models");

// Simplified from tps-next-backend's
// service/campaign/filterUnsubscribedRecipients.js: source checks both
// `lead_consent` and the legacy `unsubscribes` table (a dual-write
// architecture that existed to support the workflow engine's multi-channel
// opt-out). This build has no `lead_consent` table/workflow engine — the
// `unsubscribes` table is the sole opt-out source of truth.
async function filterUnsubscribedRecipients(recipients) {
  if (!recipients?.length) return [];

  const emails = [
    ...new Set(recipients.map((r) => r.email.trim().toLowerCase())),
  ];

  const unsubRows = await Unsubscribe.findAll({
    where: { email: { [Op.in]: emails } },
    attributes: ["email"],
    raw: true,
  });

  const optedOut = new Set(
    unsubRows.map((r) => r.email && r.email.toLowerCase()).filter(Boolean)
  );

  return recipients.filter(
    (r) => !optedOut.has(r.email.trim().toLowerCase())
  );
}

module.exports = {
  filterUnsubscribedRecipients,
};
