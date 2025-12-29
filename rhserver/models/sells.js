"use strict";

module.exports = (sequelize, DataTypes) => {
  const Sells = sequelize.define(
    "Sells",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      franchiseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      shareId: { type: DataTypes.INTEGER, allowNull: false },
      actualPrice: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      sellingPrice: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      quantityAvailable: { type: DataTypes.INTEGER, allowNull: false },
      minimumOrderQuatity: { type: DataTypes.INTEGER, allowNull: true },
      shareInStock: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      preShareTransfer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fixedPrice: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      bestDeal: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      confirmDelivery: { type: DataTypes.BOOLEAN, allowNull: true },
      deliveryTimeline: { type: DataTypes.STRING, allowNull: true },
      endSellerLocation: { type: DataTypes.STRING, allowNull: true },
      endSellerName: { type: DataTypes.STRING, allowNull: true },
      endSellerProfile: { type: DataTypes.STRING, allowNull: true },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Sells;
};
