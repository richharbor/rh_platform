"use strict";
const { ulid } = require("ulid");
const { CAMPAIGN_STATUS } = require("../constants/campaign");
const { getSchema } = require("../config/schema");

// Ported from tps-next-backend's models/campaign.js, + schema option.
//
// Note: `sender_email`/`sender_name` are kept as-is from source, but per
// the plan they are now DISPLAY-only hints (shown in the UI, used as
// reply-to) rather than the literal SMTP envelope-from — this build has a
// single Google SMTP identity (see service/email/sendEmail.js), not the
// source's multi-provider PROVIDERS map keyed by sender_email.
module.exports = (sequelize, DataTypes) => {
  const Campaign = sequelize.define(
    "Campaign",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => ulid(),
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING,
        defaultValue: "email",
      },

      status: {
        type: DataTypes.STRING,
        defaultValue: CAMPAIGN_STATUS.DRAFT,
      },

      sender_name: DataTypes.STRING,

      sender_email: DataTypes.STRING,

      subject: DataTypes.TEXT,

      content: DataTypes.TEXT,

      recipient_filters: {
        type: DataTypes.JSONB,
      },

      scheduled_at: DataTypes.DATE,

      sent_at: DataTypes.DATE,
    },
    {
      schema: getSchema(),
      tableName: "campaigns",
    },
  );

  return Campaign;
};
