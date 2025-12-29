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
        type: Sequelize.STRING,
        defaultValue: 'new'
      },
      // Product & Type
      product_type: { type: Sequelize.STRING, allowNull: true }, // Made nullable for compatibility or fix later
      lead_type: { type: Sequelize.STRING, allowNull: true },

      // Internal Admin Fields
      priority: {
        type: Sequelize.ENUM('High', 'Medium', 'Low'),
        defaultValue: 'Medium'
      },
      assigned_rm_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      internal_status: {
        type: Sequelize.ENUM('New', 'In Progress', 'Credit Approved', 'Disbursed', 'Closed', 'Rejected'),
        defaultValue: 'New'
      },
      rejection_reason: { type: Sequelize.TEXT },
      lead_score: { type: Sequelize.INTEGER, defaultValue: 0 },
      internal_notes: { type: Sequelize.JSONB, defaultValue: [] },

      // Legacy Partner ID
      partner_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userId: { // Matches Lead.js internal usage often
        type: Sequelize.INTEGER,
        field: 'user_id', // Map userId to user_id column
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      data: {
        type: Sequelize.JSON
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
