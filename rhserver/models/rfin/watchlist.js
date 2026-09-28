"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.watchlist — see migrations/rfin/0003.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinWatchlist",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    company_id: { type: DataTypes.STRING(64), allowNull: false },
    },
    { schema: getRfinSchema(), tableName: "watchlist", timestamps: true }
  );

  M.associate = (m) => {
    M.belongsTo(m.rfinCompany, { foreignKey: "company_id", as: "company" });
  };

  return M;
};
