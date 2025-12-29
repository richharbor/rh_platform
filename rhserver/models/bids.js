"use strict";

module.exports = (sequelize, DataTypes) => {
    const Bids = sequelize.define(
        "Bids",
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            franchiseId: {
                type: DataTypes.INTEGER,
                allowNull: true,

            },
            sellId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            buyerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            bidPrice: {
                type: DataTypes.DECIMAL(15, 3),
                allowNull: false,
            }
        },
        {
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Bids;
};
