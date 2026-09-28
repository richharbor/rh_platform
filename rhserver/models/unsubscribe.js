"use strict";

const { Model } = require("sequelize");
const { ulid } = require("ulid");
const { getSchema } = require("../config/schema");

// Ported from tps-next-backend's models/unsubscribe.js, + schema option.
// This is the SOLE opt-out table in this build — source's dual
// `lead_consent` + `unsubscribes` architecture existed to support a
// workflow engine that is out of scope here (see plan's Key Implementation
// Notes). No `lead_consent` table/model exists in this build.
module.exports = (sequelize, DataTypes) => {
  class Unsubscribe extends Model {
    static associate(models) {
      Unsubscribe.belongsTo(models.Campaign, {
        foreignKey: "campaignId",
        as: "campaign",
      });
    }
  }

  Unsubscribe.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => ulid(),
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      campaignId: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Unsubscribe",
      tableName: "unsubscribes",
      schema: getSchema(),
      timestamps: true,
    },
  );

  return Unsubscribe;
};
