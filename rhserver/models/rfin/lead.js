"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.leads — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinLead",
    {
    id: { type: DataTypes.STRING(16), primaryKey: true },
    partner_id: { type: DataTypes.INTEGER, allowNull: false },
    client: { type: DataTypes.STRING, allowNull: false },
    need: { type: DataTypes.STRING(32), allowNull: false },
    product_id: { type: DataTypes.STRING(64), allowNull: true },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "new" },
    potential: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    next_action: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING(15), allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    segment: { type: DataTypes.STRING(16), allowNull: true },
    company_id: { type: DataTypes.STRING(64), allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true },
    documents: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    notes: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    case_id: { type: DataTypes.STRING(16), allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "leads", timestamps: true }
  );

  return M;
};
