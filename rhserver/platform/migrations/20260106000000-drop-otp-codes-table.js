'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('otp_codes');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('otp_codes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            code_hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            purpose: {
                type: Sequelize.STRING,
                defaultValue: 'login'
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            last_sent_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
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
    }
};
