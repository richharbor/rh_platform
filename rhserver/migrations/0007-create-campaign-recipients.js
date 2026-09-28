"use strict";

const { getSchema } = require("../config/schema");

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: "campaign_recipients", schema },
      {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        campaign_id: {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: { tableName: "campaigns", schema },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        source_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        source_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "pending",
        },
        sent_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        error: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    await queryInterface.dropTable({ tableName: "campaign_recipients", schema });
  },
};
