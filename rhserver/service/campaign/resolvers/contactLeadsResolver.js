const { ContactDetail } = require("../../../models");

// Ported unchanged from tps-next-backend's
// service/campaign/resolver/contactLeadsResolver.js.
async function resolveContactLeads(filters) {
  if (!filters?.contactListIds?.length) return [];

  const leads = [];

  for (const contactListId of filters.contactListIds) {
    const contacts = await ContactDetail.findAll({
      where: { contactListId },
      attributes: ["id", "name", "email", "phone", "contactListId"],
      raw: true,
    });

    const mapped = contacts.map((contact) => ({
      email: contact.email,
      name: contact.name,
      phone: contact.phone,
      source_type: "contact_list",
      source_id: contact.id,
    }));

    leads.push(...mapped);
  }

  return leads;
}

module.exports = { resolveContactLeads };
