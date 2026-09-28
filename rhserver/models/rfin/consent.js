"use strict";

const { getRfinSchema } = require("../../config/schema");

// rfin.consents — see migrations/0011-create-rfin-schema.js.
module.exports = (sequelize, DataTypes) => {
  const M = sequelize.define(
    "rfinConsent",
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    },
    { schema: getRfinSchema(), tableName: "consents", timestamps: true }
  );

  return M;
};
