"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.lucky_draw_entries — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinLuckyDrawEntry",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    draw_id: { type: DataTypes.STRING(64), allowNull: false },
    progress: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    state: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "progress" },
    entry_id: { type: DataTypes.STRING(32), allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "lucky_draw_entries", timestamps: true }
  );

  M.associate = (m) => {
    M.belongsTo(m.rfinLuckyDraw, { foreignKey: "draw_id", as: "draw" });
  };
  return M;
};
