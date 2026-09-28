"use strict";

const { getSchema } = require("../config/schema");

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: "admins", schema },
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
        password_hash: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: "roles", schema },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        status: {
          type: Sequelize.ENUM("invited", "active", "disabled"),
          allowNull: false,
          defaultValue: "invited",
        },
        invite_token: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true,
        },
        invite_token_expires_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        invited_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: "admins", schema },
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        last_login_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: "admins", schema });
    // Drop the ENUM type Postgres created for the `status` column so a
    // re-run of `up` after a `down` doesn't collide with a leftover type.
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "${schema}"."enum_admins_status"`
    );
  },
};
