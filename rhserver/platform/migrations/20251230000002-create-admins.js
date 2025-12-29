'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admins', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true // Nullable until onboarded if invited by email only
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING,
                allowNull: true // Nullable for invited users
            },
            role_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'admin_roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            // Invite Flow Fields
            invite_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            invite_expires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('admins');
    }
};
