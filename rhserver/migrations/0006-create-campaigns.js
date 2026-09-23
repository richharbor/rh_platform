"use strict";

const { getSchema } = require("../config/schema");

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: "campaigns", schema },
      {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "email",
        },
        status: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "draft",
        },
        sender_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sender_email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        subject: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        recipient_filters: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        scheduled_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        sent_at: {
          type: Sequelize.DATE,
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
    await queryInterface.dropTable({ tableName: "campaigns", schema });
  },
};
