"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.goals — see migrations/rfin/0005.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinGoal",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      need: { type: DataTypes.STRING(32), allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      target: { type: DataTypes.BIGINT, allowNull: false },
      target_date: { type: DataTypes.DATEONLY, allowNull: false },
      contributions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "active" },
    },
    { schema: getRfinSchema(), tableName: "goals", timestamps: true }
  );
