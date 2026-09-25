"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.companies — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinCompany",
    {
    id: { type: DataTypes.STRING(64), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sector: { type: DataTypes.STRING, allowNull: false },
    themes: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    summary: { type: DataTypes.TEXT, allowNull: false },
    prices: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    min_lot: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    is_new_supply: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    risks: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    transfer_restrictions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    },
    { schema: getRfinSchema(), tableName: "companies", timestamps: true }
  );

  return M;
};
