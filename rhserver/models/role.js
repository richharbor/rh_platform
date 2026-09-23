"use strict";

const { getSchema } = require("../config/schema");

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "role",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // module -> action -> boolean, e.g.
      // { blogs: { view: true, create: true }, leads: { view: true } }
      permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      // Protects the seeded Super Admin role from edit/delete via the UI/API.
      is_system: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      schema: getSchema(),
      tableName: "roles",
      timestamps: true,
      underscored: true,
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.admin, { foreignKey: "role_id", as: "admins" });
  };

  return Role;
};
