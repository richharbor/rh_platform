"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.kyc_items — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinKycItem",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    item_key: { type: DataTypes.STRING(32), allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    why: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "not_started" },
    rejection_reason: { type: DataTypes.STRING, allowNull: true },
    file_name: { type: DataTypes.STRING, allowNull: true },
    review_until: { type: DataTypes.DATE, allowNull: true },
    sort: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { schema: getRfinSchema(), tableName: "kyc_items", timestamps: true }
  );

  return M;
};
