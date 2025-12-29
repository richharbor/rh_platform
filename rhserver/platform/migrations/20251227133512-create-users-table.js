'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true, // Nullable for phone-only signup initially
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: 'customer'
      },
      city: {
        type: Sequelize.STRING
      },
      pan: {
        type: Sequelize.STRING
      },
      gst_number: {
        type: Sequelize.STRING
      },
      company_name: {
        type: Sequelize.STRING
      },
      onboarding_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_verified_at: {
        type: Sequelize.DATE
      },
      phone_verified_at: {
        type: Sequelize.DATE
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      kyc_status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      wallet_balance: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      signup_step: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      signup_data: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      biometric_key: {
        type: Sequelize.STRING
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

    // Add index for performance
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phone']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
