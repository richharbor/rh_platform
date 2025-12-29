'use strict';

module.exports = (sequelize, DataTypes) => {
  const LiquidateShare = sequelize.define(
    'LiquidateShare',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      profile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shareName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'liquidate_shares',
      timestamps: true,
    }
  );

  return LiquidateShare;
};
