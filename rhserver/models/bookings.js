"use strict";

module.exports = (sequelize, DataTypes) => {
    const Bookings = sequelize.define(
        "Bookings",
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
            }
        },
        {
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return Bookings;
};
