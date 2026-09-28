// Single source of truth for the Postgres schema all rhserver tables live
// under. Lets the same codebase be redeployed against a different schema
// (e.g. for an unrelated dataset) with zero code changes — just set
// DB_SCHEMA in the environment.
const getSchema = () => process.env.DB_SCHEMA || "admin";

// RFIN customer platform (the Expo app + desktop app) lives in its own schema
// alongside the admin one, so the two datasets never share tables. RFIN models
// and migrations pin this explicitly rather than inheriting `define.schema`.
const getRfinSchema = () => process.env.RFIN_SCHEMA || "rfin";

module.exports = { getSchema, getRfinSchema };
