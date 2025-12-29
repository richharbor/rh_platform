'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //  Add franchiseId column to Users table
    await queryInterface.addColumn('Users', 'franchiseId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Franchises',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    //  Remove column on rollback
    await queryInterface.removeColumn('Users', 'franchiseId');
  },
};
