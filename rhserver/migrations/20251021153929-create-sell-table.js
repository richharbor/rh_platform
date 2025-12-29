"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sells", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      franchiseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Franchises",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      shareId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Shares",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      actualPrice: {
        type: Sequelize.DECIMAL(15, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      sellingPrice: {
        type: Sequelize.DECIMAL(15, 3),
        allowNull: false,
        defaultValue: 0.0,
      },
      quantityAvailable: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      minimumOrderQuatity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      shareInStock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      preShareTransfer: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      fixedPrice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      confirmDelivery: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      deliveryTimeline: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      endSellerLocation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      endSellerName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      endSellerProfile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Sells");
  },
};
