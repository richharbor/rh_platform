"use strict";

const { getRfinSchema } = require("../../config/schema");

// RFIN customer platform — everything the Expo app and the desktop app read and
// write. One migration for the whole first slice (steps 1–3 of the app plan):
// identity, catalogue, KYC, bank, consent, orders, rewards, partner book.
// Money is integer paise (BIGINT). State columns hold the lifecycle names from
// rhserver/shared/rfin/src/states.ts.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    const ts = {
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    };
    const customerFk = {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: t("customers"), key: "id" },
      onDelete: "CASCADE",
    };
    const json = (defaultValue) => ({ type: Sequelize.JSONB, allowNull: false, defaultValue });

    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

    // ── Identity ───────────────────────────────────────────────────────
    await queryInterface.createTable(t("customers"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      rfin_id: { type: Sequelize.STRING(16), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(15), allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      needs: json([]),
      roles: json(["buyer"]),
      referral_code: { type: Sequelize.STRING, allowNull: true },
      onboarded: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...ts,
    });

    await queryInterface.createTable(t("otp_requests"), {
      id: { type: Sequelize.STRING(32), primaryKey: true },
      phone: { type: Sequelize.STRING(15), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      consumed_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("otp_requests"), ["phone"]);

    // ── Catalogue ──────────────────────────────────────────────────────
    await queryInterface.createTable(t("products"), {
      id: { type: Sequelize.STRING(64), primaryKey: true },
      category: { type: Sequelize.STRING(32), allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      provider: { type: Sequelize.STRING, allowNull: false },
      tagline: { type: Sequelize.STRING, allowNull: false },
      who_for: { type: Sequelize.STRING, allowNull: false },
      requirements: json([]),
      costs: json([]),
      risks: json([]),
      what_next: json([]),
      min_amount: { type: Sequelize.BIGINT, allowNull: true },
      transactable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      sort: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...ts,
    });

    await queryInterface.createTable(t("companies"), {
      id: { type: Sequelize.STRING(64), primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      sector: { type: Sequelize.STRING, allowNull: false },
      themes: json([]),
      summary: { type: Sequelize.TEXT, allowNull: false },
      // [{ kind, perShare (paise), asOf, source }] — kinds never merged (report #91)
      prices: json([]),
      min_lot: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_new_supply: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      risks: json([]),
      transfer_restrictions: json([]),
      ...ts,
    });

    // ── KYC, bank, consent ─────────────────────────────────────────────
    await queryInterface.createTable(t("kyc_items"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      item_key: { type: Sequelize.STRING(32), allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      why: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING(32), allowNull: false, defaultValue: "not_started" },
      rejection_reason: { type: Sequelize.STRING, allowNull: true },
      file_name: { type: Sequelize.STRING, allowNull: true },
      review_until: { type: Sequelize.DATE, allowNull: true },
      sort: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      ...ts,
    });
    await queryInterface.addIndex(t("kyc_items"), ["customer_id", "item_key"], { unique: true });

    await queryInterface.createTable(t("bank_accounts"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      bank: { type: Sequelize.STRING, allowNull: false },
      last4: { type: Sequelize.STRING(4), allowNull: false },
      ifsc: { type: Sequelize.STRING(11), allowNull: false },
      holder: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "verifying" },
      primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      failure_reason: { type: Sequelize.STRING, allowNull: true },
      verify_at: { type: Sequelize.DATE, allowNull: true },
      will_fail: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...ts,
    });
    await queryInterface.addIndex(t("bank_accounts"), ["customer_id"]);

    // Consent is append-only: timestamped and never updated (report #20, #33).
    await queryInterface.createTable(t("consents"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      subject: { type: Sequelize.STRING, allowNull: false },
      items: json([]),
      ...ts,
    });
    await queryInterface.addIndex(t("consents"), ["customer_id"]);

    // ── Orders ─────────────────────────────────────────────────────────
    await queryInterface.createTable(t("orders"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      customer_id: customerFk,
      kind: { type: Sequelize.STRING(16), allowNull: false },
      subject_id: { type: Sequelize.STRING(64), allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING(32), allowNull: false, defaultValue: "submitted" },
      payment: { type: Sequelize.STRING(16), allowNull: true },
      amount: { type: Sequelize.BIGINT, allowNull: false },
      timeline: json([]),
      action: { type: Sequelize.JSONB, allowNull: true },
      // time-driven progression: the provider "responds" when next_at passes
      next_at: { type: Sequelize.DATE, allowNull: true },
      fail_payment: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      idempotency_key: { type: Sequelize.STRING(64), allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("orders"), ["customer_id", "createdAt"]);
    // Same key from the same customer can only ever create one order (report #37).
    await queryInterface.addIndex(t("orders"), ["customer_id", "idempotency_key"], { unique: true });

    // ── Rewards ────────────────────────────────────────────────────────
    // Points ledger only — never mixed with cash or commission (report #53).
    await queryInterface.createTable(t("point_entries"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      description: { type: Sequelize.STRING, allowNull: false },
      points: { type: Sequelize.INTEGER, allowNull: false },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "issued" },
      ref: { type: Sequelize.STRING, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("point_entries"), ["customer_id"]);

    await queryInterface.createTable(t("lucky_draws"), {
      id: { type: Sequelize.STRING(64), primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      threshold: { type: Sequelize.INTEGER, allowNull: false },
      draw_date: { type: Sequelize.DATEONLY, allowNull: false },
      prize: { type: Sequelize.STRING, allowNull: false },
      terms: { type: Sequelize.TEXT, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      ...ts,
    });

    await queryInterface.createTable(t("lucky_draw_entries"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      draw_id: { type: Sequelize.STRING(64), allowNull: false, references: { model: t("lucky_draws"), key: "id" }, onDelete: "CASCADE" },
      progress: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      state: { type: Sequelize.STRING(32), allowNull: false, defaultValue: "progress" },
      entry_id: { type: Sequelize.STRING(32), allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("lucky_draw_entries"), ["customer_id", "draw_id"], { unique: true });

    // ── Partner book ───────────────────────────────────────────────────
    await queryInterface.createTable(t("leads"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      partner_id: { ...customerFk },
      client: { type: Sequelize.STRING, allowNull: false },
      need: { type: Sequelize.STRING(32), allowNull: false },
      product_id: { type: Sequelize.STRING(64), allowNull: true },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "new" },
      potential: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 },
      next_action: { type: Sequelize.STRING, allowNull: false },
      ...ts,
    });
    await queryInterface.addIndex(t("leads"), ["partner_id"]);

    await queryInterface.createTable(t("commissions"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      partner_id: { ...customerFk },
      description: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.BIGINT, allowNull: false },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "pending" },
      case_id: { type: Sequelize.STRING(16), allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("commissions"), ["partner_id"]);
  },

  async down(queryInterface) {
    // The rfin schema holds only these tables, so dropping it is the clean undo.
    await queryInterface.sequelize.query(`DROP SCHEMA IF EXISTS "${getRfinSchema()}" CASCADE`);
  },
};
