'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('leads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('New', 'In Progress', 'Credit Approved', 'Disbursed', 'Closed', 'Rejected'),
        defaultValue: 'New'
      },

      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      // Product & Type
      product_type: { type: Sequelize.STRING, allowNull: false },
      lead_type: { type: Sequelize.STRING, allowNull: false },

      // App Fields
      city: { type: Sequelize.STRING },
      requirement: { type: Sequelize.TEXT },
      product_details: { type: Sequelize.JSONB },

      // Compliance
      consent_confirmed: { type: Sequelize.BOOLEAN, defaultValue: false },
      convert_to_referral: { type: Sequelize.BOOLEAN, defaultValue: false },

      // Internal Admin Fields
      priority: {
        type: Sequelize.ENUM('High', 'Medium', 'Low'),
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
    await queryInterface.dropTable('leads');
  }
};
