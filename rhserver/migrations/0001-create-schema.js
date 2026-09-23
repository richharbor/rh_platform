"use strict";

const { getSchema } = require("../config/schema");

// Safety net alongside scripts/ensure-schema.js: if this migration is the
// very first thing to run against a fresh database, the schema still gets
// created before any createTable call needs it.
module.exports = {
  async up(queryInterface) {
    const schema = getSchema();
    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  },

  async down(queryInterface) {
    // Intentionally a no-op: dropping the schema here would cascade-drop
    // every other table created by later migrations too.
  },
};
