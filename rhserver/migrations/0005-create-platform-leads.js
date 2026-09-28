"use strict";

const { getSchema } = require("../config/schema");

// Consolidated createTable for the Platform Leads (admin-management) module.
// Trimmed from tps-next-backend's platform_leads table: no
// airtableSynced/airtableSyncedAt/leads91Synced/leads91SyncedAt columns and
// no phoneVerification association — see models/platformLead.js.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: "platform_leads", schema },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM(
            "Not interested",
            "Positive",
            "Hot Lead",
            "Next Cohort",
            "Paid"
          ),
          allowNull: false,
          defaultValue: "Positive",
        },
        assignedTo: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        additionalData: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: {},
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: "platform_leads", schema });
    // Drop the ENUM type Postgres auto-created for the `status` column so a
    // re-run of `up` after a `down` doesn't collide with a leftover type.
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "${schema}"."enum_platform_leads_status"`
    );
  },
};
