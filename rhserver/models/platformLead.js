"use strict";

const { getSchema } = require("../config/schema");

// Ported from tps-next-backend's models/platformlead.js, trimmed for
// admin-management-only scope:
//  - no `phoneVerification` association / PhoneVerification model dependency
//  - no airtable/91leads sync columns (nothing in this build syncs to those
//    services)
//  - no afterCreate/afterBulkCreate workflow-trigger hooks
//
// `assignedTo` is kept as a plain STRING (not an `admins.id` FK) to match
// the source's loose "assign by display name" semantics exactly — see the
// design note in this build's report for the reasoning.
module.exports = (sequelize, DataTypes) => {
  const PlatformLead = sequelize.define(
    "platformLead",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "Not interested",
          "Positive",
          "Hot Lead",
          "Next Cohort",
          "Paid"
        ),
        allowNull: false,
        defaultValue: "Positive",
      },
      assignedTo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      additionalData: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
    },
    {
      schema: getSchema(),
      tableName: "platform_leads",
      timestamps: true,
    }
  );

  return PlatformLead;
};
