"use strict";

const { getSchema } = require("../config/schema");

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: "unsubscribes", schema },
      {
        id: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        campaignId: {
          type: Sequelize.STRING,
          allowNull: true,
          references: {
            model: { tableName: "campaigns", schema },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        reason: {
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
    await queryInterface.dropTable({ tableName: "unsubscribes", schema });
  },
};
