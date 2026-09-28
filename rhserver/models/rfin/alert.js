"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.alerts — see migrations/rfin/0005.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinAlert",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      company_id: { type: DataTypes.STRING(64), allowNull: false },
      kind: { type: DataTypes.STRING(16), allowNull: false },
      threshold: { type: DataTypes.BIGINT, allowNull: true },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      triggered_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "alerts", timestamps: true }
  );
