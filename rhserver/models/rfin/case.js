"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.cases — see migrations/rfin/0004.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinCase",
    {
      id: { type: DataTypes.STRING(16), primaryKey: true },
      partner_id: { type: DataTypes.INTEGER, allowNull: false },
      lead_id: { type: DataTypes.STRING(16), allowNull: false },
      client: { type: DataTypes.STRING, allowNull: false },
      subject: { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      stage: { type: DataTypes.STRING(24), allowNull: false, defaultValue: "kyc_pending" },
      owner: { type: DataTypes.STRING, allowNull: false },
      next_action: { type: DataTypes.STRING, allowNull: true },
      sla_due: { type: DataTypes.DATE, allowNull: true },
      timeline: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      next_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "cases", timestamps: true }
  );
