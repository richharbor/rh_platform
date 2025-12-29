'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {
        static associate(models) {
            Admin.belongsTo(models.AdminRole, {
                foreignKey: 'role_id',
                as: 'role'
            });
            // Optionally link Admin to Leads they are assigned to
            Admin.hasMany(models.Lead, {
                foreignKey: 'assigned_rm_id',
                as: 'assigned_leads'
            });
        }
    }

    Admin.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: true
        },
        invite_token: { type: DataTypes.STRING },
        invite_expires: { type: DataTypes.DATE },
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'admin_roles',
                key: 'id'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Admin',
        tableName: 'admins',
        timestamps: true
        // defaultScope: {
        //   attributes: { exclude: ['password_hash'] }
        // }
    });

    return Admin;
};
