"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RoleRequest extends Model {
    static associate(models) {
      RoleRequest.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });
      RoleRequest.belongsTo(models.Roles, {
        foreignKey: "roleId",
        as: "role",
      });
    }
  }

  RoleRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      reason: {
        type: DataTypes.TEXT,
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
      },
      reviewedAt: {
        type: DataTypes.DATE,
      },
      reviewNotes: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "RoleRequest",
    }
  );

  return RoleRequest;
};
