'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('otp_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      code_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      purpose: {
        type: Sequelize.STRING // 'login', 'signup', 'reset'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      last_sent_at: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('otp_codes');
  }
};
