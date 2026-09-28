"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.support_tickets — see migrations/rfin/0002.
module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "rfinSupportTicket",
    {
      id: { type: DataTypes.STRING(16), primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      subject: { type: DataTypes.STRING, allowNull: false },
      context_type: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "general" },
      context_id: { type: DataTypes.STRING(64), allowNull: true },
      state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "open" },
      messages: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      reply_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "support_tickets", timestamps: true }
  );
