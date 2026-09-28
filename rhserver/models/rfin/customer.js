"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.customers — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinCustomer",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    rfin_id: { type: DataTypes.STRING(16), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true, validate: { isEmail: true } },
    city: { type: DataTypes.STRING, allowNull: true },
    needs: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    roles: { type: DataTypes.JSONB, allowNull: false, defaultValue: ["buyer"] },
    referral_code: { type: DataTypes.STRING, allowNull: true },
    onboarded: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    own_code: { type: DataTypes.STRING(16), allowNull: true, unique: true },
    financial: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    notification_prefs: { type: DataTypes.JSONB, allowNull: false, defaultValue: { channels: { push: true, email: true, sms: false, whatsapp: false }, categories: { applications: true, kyc: true, payments: true, rewards: true, product_updates: true, promotions: false } } },
    },
    { schema: getRfinSchema(), tableName: "customers", timestamps: true }
  );

  M.associate = (m) => {
    M.hasMany(m.rfinKycItem, { foreignKey: "customer_id", as: "kycItems" });
    M.hasMany(m.rfinOrder, { foreignKey: "customer_id", as: "orders" });
    M.hasMany(m.rfinBankAccount, { foreignKey: "customer_id", as: "banks" });
  };
  return M;
};
