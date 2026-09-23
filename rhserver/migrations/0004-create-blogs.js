"use strict";

const { getSchema } = require("../config/schema");

// Consolidated final shape for the Blogs module — see models/blog.js.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    await queryInterface.createTable(
      { tableName: "blogs", schema },
      {
        blog_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        author: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        publishedDate: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW,
        },
        category: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        content: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        metaTitle: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "",
        },
        metaDesc: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "",
        },
        readTime: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        thumbnailSrc: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "",
        },
        thumbnailAlt: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "",
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "draft",
        },
        placement: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "blog",
        },
        faqs: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        },
        featured: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        recommended: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        scheduledAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        publishedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    );
  },

  async down(queryInterface) {
    const schema = getSchema();
    await queryInterface.dropTable({ tableName: "blogs", schema });
  },
};
