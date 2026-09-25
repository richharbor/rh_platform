"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.referrals — see migrations/rfin/0003.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinReferral",
    {
    id: { type: DataTypes.STRING(16), primaryKey: true },
    referrer_id: { type: DataTypes.INTEGER, allowNull: false },
    need: { type: DataTypes.STRING(32), allowNull: false },
    invitee_name: { type: DataTypes.STRING, allowNull: false },
    invitee_phone: { type: DataTypes.STRING(15), allowNull: true },
    state: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "pending" },
    reward: { type: DataTypes.BIGINT, allowNull: false },
    referee_id: { type: DataTypes.INTEGER, allowNull: true },
    next_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "referrals", timestamps: true }
  );

  return M;
};
