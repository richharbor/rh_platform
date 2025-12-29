"use strict";

module.exports = (sequelize, DataTypes) => {
    const BuyQueries = sequelize.define(
        "BuyQueries",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            franchiseId: {
                type: DataTypes.INTEGER,
                allowNull: true,

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

    return BuyQueries;
};
