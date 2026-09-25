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
    },
    { schema: getRfinSchema(), tableName: "leads", timestamps: true }
  );

  return M;
};
