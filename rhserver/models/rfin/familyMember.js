"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.family_members — see migrations/rfin/0005.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinFamilyMember",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      relation: { type: DataTypes.STRING(16), allowNull: false },
      birth_year: { type: DataTypes.INTEGER, allowNull: true },
      dependent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      cover: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    { schema: getRfinSchema(), tableName: "family_members", timestamps: true }
  );
