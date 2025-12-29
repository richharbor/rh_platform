"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OnboardingApplications", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
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
      requestedRoleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      currentStep: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      completedSteps: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      formData: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      documents: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      status: {
        type: Sequelize.ENUM("draft", "pending", "approved", "rejected"),
        defaultValue: "draft",
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
      },
      reviewedAt: {
        type: Sequelize.DATE,
      },
      reviewNotes: {
        type: Sequelize.TEXT,
      },
      approvalToken: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OnboardingApplications");
  },
};
