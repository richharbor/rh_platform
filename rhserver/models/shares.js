"use strict";

module.exports = (sequelize, DataTypes) => {
  const Shares = sequelize.define(
    "Shares",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      symbol: { type: DataTypes.STRING, allowNull: true, unique: true },
      price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      market_cap: { type: DataTypes.BIGINT, allowNull: true },
      volume: { type: DataTypes.BIGINT, allowNull: true },
      sector: { type: DataTypes.STRING, allowNull: true },
      exchange: { type: DataTypes.STRING, allowNull: true },
      franchiseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Shares;
};
