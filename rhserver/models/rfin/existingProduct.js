"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.existing_products — see migrations/rfin/0005.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinExistingProduct",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      kind: { type: DataTypes.STRING(16), allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      provider: { type: DataTypes.STRING, allowNull: true },
      value: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    },
    { schema: getRfinSchema(), tableName: "existing_products", timestamps: true }
  );
