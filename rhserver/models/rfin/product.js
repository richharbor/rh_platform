"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.products — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinProduct",
    {
    id: { type: DataTypes.STRING(64), primaryKey: true },
    category: { type: DataTypes.STRING(32), allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false },
    tagline: { type: DataTypes.STRING, allowNull: false },
    who_for: { type: DataTypes.STRING, allowNull: false },
    requirements: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    costs: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    risks: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    what_next: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    min_amount: { type: DataTypes.BIGINT, allowNull: true },
    transactable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sort: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { schema: getRfinSchema(), tableName: "products", timestamps: true }
  );

  return M;
};
