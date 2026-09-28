"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.bank_accounts — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinBankAccount",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    bank: { type: DataTypes.STRING, allowNull: false },
    last4: { type: DataTypes.STRING(4), allowNull: false },
    ifsc: { type: DataTypes.STRING(11), allowNull: false },
    holder: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "verifying" },
    primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    failure_reason: { type: DataTypes.STRING, allowNull: true },
    verify_at: { type: DataTypes.DATE, allowNull: true },
    will_fail: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { schema: getRfinSchema(), tableName: "bank_accounts", timestamps: true }
  );

  return M;
};
