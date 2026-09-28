"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.holdings — see migrations/rfin/0003.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinHolding",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.STRING(64), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    reserved: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    avg_cost: { type: DataTypes.BIGINT, allowNull: false },
    realized_gain: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    },
    { schema: getRfinSchema(), tableName: "holdings", timestamps: true }
  );

  M.associate = (m) => {
    M.belongsTo(m.rfinCompany, { foreignKey: "company_id", as: "company" });
  };

  return M;
};
