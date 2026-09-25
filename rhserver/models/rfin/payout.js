"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.payouts — see migrations/rfin/0004.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinPayout",
    {
      id: { type: DataTypes.STRING(16), primaryKey: true },
      partner_id: { type: DataTypes.INTEGER, allowNull: false },
      gross: { type: DataTypes.BIGINT, allowNull: false },
      tds: { type: DataTypes.BIGINT, allowNull: false },
      net: { type: DataTypes.BIGINT, allowNull: false },
      state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "processing" },
      commission_ids: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      bank: { type: DataTypes.STRING, allowNull: true },
      next_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "payouts", timestamps: true }
  );
