// Records an in-app notification (which is also the activity event log).
// Service categories can't be muted; the rest follow the customer's prefs
// (report #49 — no excessive promotional messaging). Delivery over push /
// email / SMS / WhatsApp plugs in here once providers exist.
const db = require("../../models");

const SERVICE = ["applications", "kyc", "payments", "support"];

async function notify(customerId, { category, title, body, route, tone = "info" }, transaction) {
  if (!SERVICE.includes(category)) {
    const c = await db.rfinCustomer.findByPk(customerId, { attributes: ["notification_prefs"], transaction });
    if (c && c.notification_prefs && c.notification_prefs.categories && c.notification_prefs.categories[category] === false) return null;
  }
  return db.rfinNotification.create({ customer_id: customerId, category, title, body, route: route || null, tone }, { transaction });
}

module.exports = { notify, SERVICE };
