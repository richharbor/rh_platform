"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.sell_listings — see migrations/rfin/0003.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinSellListing",
    {
    id: { type: DataTypes.STRING(16), primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.STRING(64), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    ask: { type: DataTypes.BIGINT, allowNull: false },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "verifying" },
    timeline: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    next_at: { type: DataTypes.DATE, allowNull: true },
    buyer_interest: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    match_price: { type: DataTypes.BIGINT, allowNull: true },
    proceeds: { type: DataTypes.BIGINT, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "sell_listings", timestamps: true }
  );

  M.associate = (m) => {
    M.belongsTo(m.rfinCompany, { foreignKey: "company_id", as: "company" });
  };

  return M;
};
