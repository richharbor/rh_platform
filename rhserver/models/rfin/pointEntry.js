"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.point_entries — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinPointEntry",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "issued" },
    ref: { type: DataTypes.STRING, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "point_entries", timestamps: true }
  );

  return M;
};
