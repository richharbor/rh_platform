"use strict";

const { getSchema } = require("../config/schema");

// Ported from tps-next-backend's models/blogs.js (MongoDB-adjacent field
// naming kept as-is: blog_id PK, camelCase everywhere else) with `schema`
// added so the table lives under the app's configured Postgres schema.
// No associations — blogs are standalone in this build (no author/user FK).
module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "blog",
    {
      blog_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      publishedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      metaTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      metaDesc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      readTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      thumbnailSrc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      thumbnailAlt: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      // Publish-status of the blog: draft / scheduled / published.
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "draft",
      },
      // 'blog' = listed at /blogs. 'standalone' (source's "Landing Blogs")
      // is out of scope for this build but the column is kept so existing
      // data/values round-trip cleanly through the API.
      placement: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "blog",
      },
      // Array of { question, answer } rendered as an accordion on the blog page.
      faqs: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // 1 = legacy block editor (v1), 2 = Tiptap rich editor (v2). The
      // `content` JSON column's shape differs by version but that's opaque
      // to the backend — it's just stored and returned as-is.
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      recommended: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      schema: getSchema(),
      tableName: "blogs",
      timestamps: true,
    }
  );

  return Blog;
};
