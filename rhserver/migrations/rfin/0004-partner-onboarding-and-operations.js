"use strict";

const { getRfinSchema } = require("../../config/schema");

// Step 7: partner onboarding (Partner 360) and operations — leads, cases, payouts.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    const ts = {
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    };
    const customerFk = { type: Sequelize.INTEGER, allowNull: false, references: { model: t("customers"), key: "id" }, onDelete: "CASCADE" };
    const json = (defaultValue) => ({ type: Sequelize.JSONB, allowNull: false, defaultValue });

    // Partner 360 — six dimensions: identity, capability, network, intent, compliance, growth (report #72).
    await queryInterface.createTable(t("partner_profiles"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { ...customerFk, unique: true },
      partner_type: { type: Sequelize.STRING(32), allowNull: true },
      basic: json({}), // organisation, designation, experienceYears, city, state
      professional: json({}), // previousOrgs, certifications[], businessModel, teamSize, profileLink
      capabilities: json({}), // { category: "experienced" | "interested" | "none" }
      network: json({}), // clientBase, geographies[], segments[]
      business: json({}), // annualBusiness, monthlyLeads, avgTicket, meetingsPerMonth
      compliance: json({}), // pan, gstin, arn/licence, declarations
      payout: json({}), // preference, threshold, tdsAcknowledged
      step: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "draft" }, // draft · verifying · active · rejected
      partner_code: { type: Sequelize.STRING(16), allowNull: true, unique: true }, // Partner ID
      agreement_signed_at: { type: Sequelize.DATE, allowNull: true },
      verify_at: { type: Sequelize.DATE, allowNull: true },
      activated_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });

    // Leads get client details, the 60-second capture fields and notes (report #83, #85).
    for (const [col, def] of [
      ["phone", { type: Sequelize.STRING(15), allowNull: true }],
      ["city", { type: Sequelize.STRING, allowNull: true }],
      ["segment", { type: Sequelize.STRING(16), allowNull: true }],
      ["company_id", { type: Sequelize.STRING(64), allowNull: true }],
      ["quantity", { type: Sequelize.INTEGER, allowNull: true }],
      ["documents", json([])],
      ["notes", json([])],
      ["case_id", { type: Sequelize.STRING(16), allowNull: true }],
    ]) {
      await queryInterface.addColumn(t("leads"), col, def);
    }

    // Case 360 (report #86): stage, owner, next action, SLA, timeline.
    await queryInterface.createTable(t("cases"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      partner_id: customerFk,
      lead_id: { type: Sequelize.STRING(16), allowNull: false },
      client: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 },
      stage: { type: Sequelize.STRING(24), allowNull: false, defaultValue: "kyc_pending" },
      owner: { type: Sequelize.STRING, allowNull: false },
      next_action: { type: Sequelize.STRING, allowNull: true },
      sla_due: { type: Sequelize.DATE, allowNull: true },
      timeline: json([]),
      next_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("cases"), ["partner_id"]);

    // Payouts: requested → processing → paid, with TDS (report #80, #89).
    await queryInterface.createTable(t("payouts"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      partner_id: customerFk,
      gross: { type: Sequelize.BIGINT, allowNull: false },
      tds: { type: Sequelize.BIGINT, allowNull: false },
      net: { type: Sequelize.BIGINT, allowNull: false },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "processing" },
      commission_ids: json([]),
      bank: { type: Sequelize.STRING, allowNull: true },
      next_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("payouts"), ["partner_id"]);
    await queryInterface.addColumn(t("commissions"), "available_at", { type: Sequelize.DATE, allowNull: true });
  },

  async down(queryInterface) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    await queryInterface.removeColumn(t("commissions"), "available_at");
    await queryInterface.dropTable(t("payouts"));
    await queryInterface.dropTable(t("cases"));
    for (const c of ["phone", "city", "segment", "company_id", "quantity", "documents", "notes", "case_id"]) await queryInterface.removeColumn(t("leads"), c);
    await queryInterface.dropTable(t("partner_profiles"));
  },
};
