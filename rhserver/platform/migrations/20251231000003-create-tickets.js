'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('tickets', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false, // User who raised it
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            assigned_admin_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'admins', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
                defaultValue: 'Open'
            },
            priority: {
                type: Sequelize.ENUM('Low', 'Medium', 'High', 'Critical'),
                defaultValue: 'Medium'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('tickets');
    }
};
