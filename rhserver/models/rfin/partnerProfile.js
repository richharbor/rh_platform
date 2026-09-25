"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.partner_profiles — see migrations/rfin/0004.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinPartnerProfile",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      partner_type: { type: DataTypes.STRING(32), allowNull: true },
      basic: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      professional: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      capabilities: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      network: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      business: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      compliance: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      payout: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      step: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "draft" },
      partner_code: { type: DataTypes.STRING(16), allowNull: true, unique: true },
      agreement_signed_at: { type: DataTypes.DATE, allowNull: true },
      verify_at: { type: DataTypes.DATE, allowNull: true },
      activated_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "partner_profiles", timestamps: true }
  );
