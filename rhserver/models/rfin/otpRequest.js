"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.otp_requests — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinOtpRequest",
    {
    id: { type: DataTypes.STRING(32), primaryKey: true },
    phone: { type: DataTypes.STRING(15), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    consumed_at: { type: DataTypes.DATE, allowNull: true },
    },
    { schema: getRfinSchema(), tableName: "otp_requests", timestamps: true }
  );

  return M;
};
