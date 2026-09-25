"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.documents — see migrations/rfin/0002.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinDocument",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      kind: { type: DataTypes.STRING(24), allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      order_id: { type: DataTypes.STRING(16), allowNull: true },
      kyc_item: { type: DataTypes.STRING(32), allowNull: true },
      state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "available" },
      file_name: { type: DataTypes.STRING, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "documents", timestamps: true }
  );
