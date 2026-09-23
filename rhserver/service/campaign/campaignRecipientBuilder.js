const { resolvePlatformLeads } = require("./resolvers/platformLeadResolver");
const { resolveContactLeads } = require("./resolvers/contactLeadsResolver");

// Trimmed from tps-next-backend's
// service/campaign/campaignRecipientBuilder.js down to platform_leads +
// contact_list sources only — dropped: external_leads, events (event
// guests), resources (resource leads), recordings. None of those source
// modules (Event/Resource/external lead sync/recordings) exist in this
// build's scope.
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function buildRecipients(filters) {
  let leads = [];

  for (const source of filters.sources) {
    if (source.type === "platform_leads") {
      const platformLeads = await resolvePlatformLeads(source.filters);
      leads.push(...platformLeads);
    }

    if (source.type === "contact_list") {
      const contactLeads = await resolveContactLeads(source.filters);
      leads.push(...contactLeads);
    }
  }

  // dedupe by email
  const map = new Map();

  for (const lead of leads) {
    if (!isValidEmail(lead.email)) continue;

    const email = lead.email.trim().toLowerCase();

    if (!map.has(email)) {
      map.set(email, {
        ...lead,
        email,
        name: lead.name?.trim() || null,
        phone: lead.phone?.trim() || null,
      });
    }
  }

  return [...map.values()];
}

module.exports = {
  buildRecipients,
};
