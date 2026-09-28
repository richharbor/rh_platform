const { Op } = require("sequelize");
const { platformLead: PlatformLead } = require("../../../models");

// Ported from tps-next-backend's
// service/campaign/resolver/platformLeadResolver.js. Source filtered via a
// `filters.programs[].types[]` structure (program -> hardcoded list of
// program-name-derived types). This build has no "programs" concept, so it
// filters directly on the generic `type` column on platform_leads via a
// flat `filters.types` array instead.
async function resolvePlatformLeads(filters) {
  if (!filters?.types?.length) return [];

  const selectedTypes = [...new Set(filters.types)];

  if (selectedTypes.length === 0) return [];

  const leads = await PlatformLead.findAll({
    where: {
      type: {
        [Op.in]: selectedTypes,
      },
    },
    attributes: ["id", "name", "email", "phone", "type"],
    raw: true,
  });

  return leads.map((lead) => ({
    email: lead.email,
    name: lead.name,
    phone: lead.phone,
    source_type: "platform_leads",
    source_id: lead.id,
  }));
}

module.exports = {
  resolvePlatformLeads,
};
