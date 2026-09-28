"use strict";

const { getRfinSchema } = require("../../config/schema");

// Steps 5 + 6 of the app plan: private markets (company research, watchlist,
// holdings, buy + sell) and rewards (benefits / gift cards, referrals, draw results).
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    const ts = {
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("now") },
    };
    const customerFk = { type: Sequelize.INTEGER, allowNull: false, references: { model: t("customers"), key: "id" }, onDelete: "CASCADE" };
    const companyFk = { type: Sequelize.STRING(64), allowNull: false, references: { model: t("companies"), key: "id" }, onDelete: "CASCADE" };
    const json = (defaultValue) => ({ type: Sequelize.JSONB, allowNull: false, defaultValue });

    // ── Company research (report #91) ──────────────────────────────────
    await queryInterface.addColumn(t("companies"), "founded", { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn(t("companies"), "hq", { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn(t("companies"), "business", json({})); // { model, segments[], moat }
    await queryInterface.addColumn(t("companies"), "financials", json([])); // [{ year, revenue, profit, margin }] in ₹ Cr
    await queryInterface.addColumn(t("companies"), "peers", json([])); // [{ name, listed, metric }]
    await queryInterface.addColumn(t("companies"), "documents", json([])); // [{ title, kind }]
    await queryInterface.addColumn(t("companies"), "bid_ask", { type: Sequelize.JSONB, allowNull: true }); // { bid, ask } paise, where available

    // Private-market buy orders carry quantity × price (report #92).
    await queryInterface.addColumn(t("orders"), "quantity", { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn(t("orders"), "unit_price", { type: Sequelize.BIGINT, allowNull: true });

    await queryInterface.createTable(t("watchlist"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      company_id: companyFk,
      ...ts,
    });
    await queryInterface.addIndex(t("watchlist"), ["customer_id", "company_id"], { unique: true });

    // Holdings (report #94). `reserved` = shares committed to an open sell listing.
    await queryInterface.createTable(t("holdings"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      company_id: companyFk,
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      reserved: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      avg_cost: { type: Sequelize.BIGINT, allowNull: false }, // paise per share
      realized_gain: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 },
      ...ts,
    });
    await queryInterface.addIndex(t("holdings"), ["customer_id", "company_id"], { unique: true });

    // Sell flow: Verify → Discover → List → Match → Approvals → Transfer → Paid (report #93).
    await queryInterface.createTable(t("sell_listings"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      customer_id: customerFk,
      company_id: companyFk,
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      ask: { type: Sequelize.BIGINT, allowNull: false }, // paise per share
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "verifying" },
      timeline: json([]),
      next_at: { type: Sequelize.DATE, allowNull: true },
      buyer_interest: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      match_price: { type: Sequelize.BIGINT, allowNull: true },
      proceeds: { type: Sequelize.BIGINT, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("sell_listings"), ["customer_id"]);

    // ── Rewards (report #51–#70) ───────────────────────────────────────
    // Benefit ledger — gift cards / loaded cards, never mixed with points (report #53, #57, #58).
    await queryInterface.createTable(t("benefits"), {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: customerFk,
      kind: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "gift_card" },
      title: { type: Sequelize.STRING, allowNull: false },
      issuer: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.BIGINT, allowNull: false },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "processing" },
      code: { type: Sequelize.STRING(24), allowNull: true },
      terms: { type: Sequelize.TEXT, allowNull: false },
      source: { type: Sequelize.STRING(32), allowNull: false }, // first_txn · campaign · referral
      source_ref: { type: Sequelize.STRING(32), allowNull: true },
      ready_at: { type: Sequelize.DATE, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      redeemed_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("benefits"), ["customer_id"]);

    // Each customer's personal referral code.
    await queryInterface.addColumn(t("customers"), "own_code", { type: Sequelize.STRING(16), allowNull: true, unique: true });
    await queryInterface.sequelize.query(
      `UPDATE "${schema}".customers SET own_code = 'RF-' || upper(substr(md5(rfin_id || id::text), 1, 6)) WHERE own_code IS NULL`
    );

    // Referral ledger: Pending → Approved → Paid (report #66, #67).
    await queryInterface.createTable(t("referrals"), {
      id: { type: Sequelize.STRING(16), primaryKey: true },
      referrer_id: customerFk,
      need: { type: Sequelize.STRING(32), allowNull: false },
      invitee_name: { type: Sequelize.STRING, allowNull: false },
      invitee_phone: { type: Sequelize.STRING(15), allowNull: true },
      state: { type: Sequelize.STRING(16), allowNull: false, defaultValue: "pending" },
      reward: { type: Sequelize.BIGINT, allowNull: false },
      referee_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: t("customers"), key: "id" }, onDelete: "SET NULL" },
      next_at: { type: Sequelize.DATE, allowNull: true },
      ...ts,
    });
    await queryInterface.addIndex(t("referrals"), ["referrer_id"]);
    await queryInterface.addIndex(t("referrals"), ["invitee_phone"]);

    // Draw results / history (report #62, #64).
    await queryInterface.addColumn(t("lucky_draws"), "results", { type: Sequelize.JSONB, allowNull: true }); // { drawnAt, winners: [{ entryId, prize }] }
  },

  async down(queryInterface) {
    const schema = getRfinSchema();
    const t = (tableName) => ({ tableName, schema });
    await queryInterface.removeColumn(t("lucky_draws"), "results");
    await queryInterface.dropTable(t("referrals"));
    await queryInterface.removeColumn(t("customers"), "own_code");
    await queryInterface.dropTable(t("benefits"));
    await queryInterface.dropTable(t("sell_listings"));
    await queryInterface.dropTable(t("holdings"));
    await queryInterface.dropTable(t("watchlist"));
    for (const c of ["quantity", "unit_price"]) await queryInterface.removeColumn(t("orders"), c);
    for (const c of ["founded", "hq", "business", "financials", "peers", "documents", "bid_ask"]) await queryInterface.removeColumn(t("companies"), c);
  },
};
