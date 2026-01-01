'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('product_rules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            product_type: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            reward_percentage: {
                type: Sequelize.FLOAT,
                defaultValue: 0.0,
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        // Seed default rules
        const rules = [
            { product_type: 'insurance', reward_percentage: 15.0, is_active: true, created_at: new Date(), updated_at: new Date() },
            { product_type: 'loans', reward_percentage: 1.0, is_active: true, created_at: new Date(), updated_at: new Date() },
            { product_type: 'equity', reward_percentage: 5.0, is_active: true, created_at: new Date(), updated_at: new Date() }, // "Private Equity"
            { product_type: 'unlisted', reward_percentage: 25.0, is_active: true, created_at: new Date(), updated_at: new Date() }, // "Unlisted Shares"
            { product_type: 'stocks', reward_percentage: 0.5, is_active: true, created_at: new Date(), updated_at: new Date() } // "Bulk Listed Stock"
        ];

        await queryInterface.bulkInsert('product_rules', rules);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('product_rules');
    }
};
