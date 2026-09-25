"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.orders — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinOrder",
    {
    id: { type: DataTypes.STRING(16), primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    kind: { type: DataTypes.STRING(16), allowNull: false },
    subject_id: { type: DataTypes.STRING(64), allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "submitted" },
    payment: { type: DataTypes.STRING(16), allowNull: true },
    amount: { type: DataTypes.BIGINT, allowNull: false },
    timeline: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    action: { type: DataTypes.JSONB, allowNull: true },
    next_at: { type: DataTypes.DATE, allowNull: true },
    fail_payment: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    idempotency_key: { type: DataTypes.STRING(64), allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true },
    unit_price: { type: DataTypes.BIGINT, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "orders", timestamps: true }
  );

  return M;
};
