"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.commissions — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinCommission",
    {
    id: { type: DataTypes.STRING(16), primaryKey: true },
    partner_id: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.BIGINT, allowNull: false },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "pending" },
    case_id: { type: DataTypes.STRING(16), allowNull: true },
    available_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "commissions", timestamps: true }
  );

  return M;
};
