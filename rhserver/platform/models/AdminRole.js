'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AdminRole extends Model {
        static associate(models) {
            AdminRole.hasMany(models.Admin, {
                foreignKey: 'role_id',
                as: 'admins'
            });
        }
    }

    AdminRole.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        permissions: {
            type: DataTypes.JSONB, // Stores accessible modules/actions
            defaultValue: {}
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'AdminRole',
        tableName: 'admin_roles',
        timestamps: true
    });

    return AdminRole;
};
