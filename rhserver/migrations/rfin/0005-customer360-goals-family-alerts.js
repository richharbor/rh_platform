"use strict";

const { getRfinSchema } = require("../../config/schema");

// Step 8 (Phase 2 + 3): Customer 360 financial profile, existing products held
// elsewhere, goals as first-class objects, family members, private-market alerts.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    const ts = {
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    };
    const customerFk = { type: Sequelize.INTEGER, allowNull: false, references: { model: t("customers"), key: "id" }, onDelete: "CASCADE" };

    // Financial profile (report #15): income band, investible surplus, risk, horizon, liquidity.
    await queryInterface.addColumn(t("customers"), "financial", { type: Sequelize.JSONB, allowNull: false, defaultValue: {} });

    // Products held outside RFIN (report #16, #45) — inputs to personalisation.
    await queryInterface.createTable(t("existing_products"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      kind: { type: Sequelize.STRING(16), allowNull: false }, // investment · insurance · loan
      name: { type: Sequelize.STRING, allowNull: false },
      provider: { type: Sequelize.STRING, allowNull: true },
      value: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 }, // value · cover · outstanding (paise)
      ...ts,
    });
    await queryInterface.addIndex(t("existing_products"), ["customer_id"]);

    // Goals as first-class objects (report #17): target, date, contributions.
    await queryInterface.createTable(t("goals"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      need: { type: Sequelize.STRING(32), allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      target: { type: Sequelize.BIGINT, allowNull: false },
      target_date: { type: Sequelize.DATEONLY, allowNull: false },
      contributions: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] }, // [{ at, amount, note }]
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "active" }, // active · achieved · archived
      ...ts,
    });
    await queryInterface.addIndex(t("goals"), ["customer_id"]);

    // Family profiles (Phase 2): members and what covers them.
    await queryInterface.createTable(t("family_members"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      name: { type: Sequelize.STRING, allowNull: false },
      relation: { type: Sequelize.STRING(16), allowNull: false }, // spouse · child · parent · sibling
      birth_year: { type: Sequelize.INTEGER, allowNull: true },
      dependent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      cover: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} }, // { health: bool, life: bool }
      ...ts,
    });
    await queryInterface.addIndex(t("family_members"), ["customer_id"]);

    // Private-market alerts (report #94): price, supply, company updates.
    await queryInterface.createTable(t("alerts"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      company_id: { type: Sequelize.STRING(64), allowNull: false, references: { model: t("companies"), key: "id" }, onDelete: "CASCADE" },
      kind: { type: Sequelize.STRING(16), allowNull: false }, // price_above · price_below · new_supply · updates
      threshold: { type: Sequelize.BIGINT, allowNull: true },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      triggered_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("alerts"), ["customer_id"]);
  },

  async down(queryInterface) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    for (const table of ["alerts", "family_members", "goals", "existing_products"]) await queryInterface.dropTable(t(table));
    await queryInterface.removeColumn(t("customers"), "financial");
  },
};
