'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('incentives', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'paid', 'rejected'),
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT
      },
      lead_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'leads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('incentives');
    // Optional: Drop enum types if Postgres
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_incentives_status";'); 
  }
};
