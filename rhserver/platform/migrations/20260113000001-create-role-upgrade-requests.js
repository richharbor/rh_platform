'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('role_upgrade_requests', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            current_role: {
                type: Sequelize.STRING,
                allowNull: false
            },
            requested_role: {
                type: Sequelize.STRING,
                allowNull: false
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'pending', // pending, approved, rejected
                allowNull: false
            },
            business_data: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: {}
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            admin_notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            reviewed_by: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'admins',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            reviewed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            last_upgrade_request_at: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // Add index for faster status filtering
        await queryInterface.addIndex('role_upgrade_requests', ['status']);
        await queryInterface.addIndex('role_upgrade_requests', ['user_id', 'status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('role_upgrade_requests');
    }
};
