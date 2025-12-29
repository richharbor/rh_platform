"use strict";

module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define(
        "Transactions",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            closedBy: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            franchiseId: {
                type: DataTypes.INTEGER,
                allowNull: true,

            },
            sellerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            buyerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            shareName: { type: DataTypes.STRING, allowNull: false },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(15, 2),
                allowNull: false,
            },
        },
        {
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Transactions;
};
