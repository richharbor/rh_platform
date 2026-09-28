"use strict";

const { getRfinSchema } = require("../../config/schema");

// Step 4 of the app plan: activity centre, documents, notifications, support.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    const ts = {
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    };
    const customerFk = { type: Sequelize.INTEGER, allowNull: false, references: { model: t("customers"), key: "id" }, onDelete: "CASCADE" };

    // Channel + category preferences (report #49). Promotions default off.
    await queryInterface.addColumn(t("customers"), "notification_prefs", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        channels: { push: true, email: true, sms: false, whatsapp: false },
        categories: { applications: true, kyc: true, payments: true, rewards: true, product_updates: true, promotions: false },
      },
    });

    // One place for every record (report #46): policies, receipts, KYC, statements.
    await queryInterface.createTable(t("documents"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      kind: { type: Sequelize.STRING(24), allowNull: false }, // policy · receipt · sanction · kyc · statement
      title: { type: Sequelize.STRING, allowNull: false },
      order_id: { type: Sequelize.STRING(16), allowNull: true },
      kyc_item: { type: Sequelize.STRING(32), allowNull: true },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "available" }, // available · in_review · requested · expired
      file_name: { type: Sequelize.STRING, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("documents"), ["customer_id", "createdAt"]);

    // Also the activity event log (report #44, #48).
    await queryInterface.createTable(t("notifications"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      category: { type: Sequelize.STRING(24), allowNull: false }, // applications · kyc · payments · rewards · product_updates · promotions · support
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.STRING, allowNull: false },
      route: { type: Sequelize.STRING, allowNull: true },
      tone: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "info" },
      read_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("notifications"), ["customer_id", "createdAt"]);

    // Contextual support (report #9, #47): the ticket carries what it's about.
    await queryInterface.createTable(t("support_tickets"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      customer_id: customerFk,
      subject: { type: Sequelize.STRING, allowNull: false },
      context_type: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "general" }, // order · kyc · product · general
      context_id: { type: Sequelize.STRING(64), allowNull: true },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "open" }, // open · awaiting_you · resolved
      messages: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
      reply_at: { type: Sequelize.DATE, allowNull: true }, // mock advisor reply due
      ...ts,
    });
    await queryInterface.addIndex(t("support_tickets"), ["customer_id", "updatedAt"]);
  },

  async down(queryInterface) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    await queryInterface.dropTable(t("support_tickets"));
    await queryInterface.dropTable(t("notifications"));
    await queryInterface.dropTable(t("documents"));
    await queryInterface.removeColumn(t("customers"), "notification_prefs");
  },
};
