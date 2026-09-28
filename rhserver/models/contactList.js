"use strict";

const { Model } = require("sequelize");
const { getSchema } = require("../config/schema");

// Ported from tps-next-backend's models/contactlist.js, + schema option.
module.exports = (sequelize, DataTypes) => {
  class ContactList extends Model {
    static associate(models) {
      ContactList.hasMany(models.ContactDetail, {
        foreignKey: "contactListId",
        as: "contacts",
        onDelete: "CASCADE",
      });
    }
  }

  ContactList.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ContactList",
      tableName: "ContactLists",
      schema: getSchema(),
      timestamps: true,
    }
  );

  return ContactList;
};
