'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('contests', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            banner_url: {
                type: Sequelize.STRING
            },
            terms_and_conditions: {
                type: Sequelize.TEXT
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            target_type: {
                type: Sequelize.ENUM('incentive', 'premium', 'leads_count'),
                defaultValue: 'incentive'
            },
            tiers: {
                type: Sequelize.JSONB, // Stores array of { name, minAmount, rewardDescription, segment }
                defaultValue: []
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex('contests', ['start_date', 'end_date']);
        await queryInterface.addIndex('contests', ['is_active']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('contests');
    }
};
