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
            partner_percentage: {
                type: Sequelize.FLOAT,
                defaultValue: 0.0,
                allowNull: false,
                comment: 'Reward percentage for Partner role'
            },
            customer_percentage: {
                type: Sequelize.FLOAT,
                defaultValue: 0.0,
                allowNull: false,
                comment: 'Reward percentage for Customer role'
            },
            referral_partner_percentage: {
                type: Sequelize.FLOAT,
                defaultValue: 0.0,
                allowNull: false,
                comment: 'Reward percentage for Referral Partner role'
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

        // Seed default rules with role-based percentages
        const rules = [
            {
                product_type: 'insurance',
                partner_percentage: 15.0,
                customer_percentage: 5.0,
                referral_partner_percentage: 10.0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_type: 'loans',
                partner_percentage: 1.0,
                customer_percentage: 0.5,
                referral_partner_percentage: 0.75,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_type: 'equity',
                partner_percentage: 5.0,
                customer_percentage: 2.0,
                referral_partner_percentage: 3.5,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_type: 'unlisted',
                partner_percentage: 25.0,
                customer_percentage: 10.0,
                referral_partner_percentage: 15.0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_type: 'stocks',
                partner_percentage: 0.5,
                customer_percentage: 0.2,
                referral_partner_percentage: 0.35,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('product_rules', rules);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('product_rules');
    }
};
