"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Sells", "bestDeal", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue:false,
    });

    await queryInterface.addColumn("Sells", "approved", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Sells", "bestDeal");
    await queryInterface.removeColumn("Sells", "approved");
  },
};