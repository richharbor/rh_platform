"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.lucky_draws — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinLuckyDraw",
    {
    id: { type: DataTypes.STRING(64), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    threshold: { type: DataTypes.INTEGER, allowNull: false },
    draw_date: { type: DataTypes.DATEONLY, allowNull: false },
    prize: { type: DataTypes.STRING, allowNull: false },
    terms: { type: DataTypes.TEXT, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    results: { type: DataTypes.JSONB, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "lucky_draws", timestamps: true }
  );

  return M;
};
