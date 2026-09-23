"use strict";

const { getSchema } = require("../config/schema");

// Replaces tps-next-backend's flat `company.role` string model with a real
// roles/admins RBAC pair (see models/role.js + middlewares/authenticate.js).
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    "admin",
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
      // Nullable until the invite is accepted and the admin sets a password.
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("invited", "active", "disabled"),
        allowNull: false,
        defaultValue: "invited",
      },
      invite_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      invite_token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      invited_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      schema: getSchema(),
      tableName: "admins",
      timestamps: true,
      underscored: true,
    }
  );

  Admin.associate = (models) => {
    Admin.belongsTo(models.role, { foreignKey: "role_id", as: "role" });
    Admin.belongsTo(models.admin, { foreignKey: "invited_by", as: "inviter" });
  };

  return Admin;
};
