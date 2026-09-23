// Single source of truth for the Postgres schema all rhserver tables live
// under. Lets the same codebase be redeployed against a different schema
// (e.g. for an unrelated dataset) with zero code changes — just set
// DB_SCHEMA in the environment.
const getSchema = () => process.env.DB_SCHEMA || "admin";

module.exports = { getSchema };
