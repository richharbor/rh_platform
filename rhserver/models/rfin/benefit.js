"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.benefits — see migrations/rfin/0003.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinBenefit",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    kind: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "gift_card" },
    title: { type: DataTypes.STRING, allowNull: false },
    issuer: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.BIGINT, allowNull: false },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "processing" },
    code: { type: DataTypes.STRING(24), allowNull: true },
    terms: { type: DataTypes.TEXT, allowNull: false },
    source: { type: DataTypes.STRING(32), allowNull: false },
    source_ref: { type: DataTypes.STRING(32), allowNull: true },
    ready_at: { type: DataTypes.DATE, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    redeemed_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "benefits", timestamps: true }
  );

  return M;
};
