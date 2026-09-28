"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.notifications — see migrations/rfin/0002.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinNotification",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      category: { type: DataTypes.STRING(24), allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      body: { type: DataTypes.STRING, allowNull: false },
      route: { type: DataTypes.STRING, allowNull: true },
      tone: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "info" },
      read_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "notifications", timestamps: true }
  );
