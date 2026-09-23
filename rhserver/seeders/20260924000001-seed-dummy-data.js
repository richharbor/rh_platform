"use strict";

const { ulid } = require("ulid");
const { getSchema } = require("../config/schema");

// Local-dev-only dummy data so the admin-panel UI has something to render
// across Blogs / Leads / Marketing. Not meant to represent real content.
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = getSchema();
    const t = (name) => ({ tableName: name, schema });
    const now = new Date();

    // ── Blogs ──────────────────────────────────────────────────────────
    await queryInterface.bulkInsert(t("blogs"), [
      {
        title: "Getting Started with Product Management",
        author: "Super Admin",
        publishedDate: now,
        category: "Product Management",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Dummy blog content for local testing." },
              ],
            },
          ],
        }),
        metaTitle: "Getting Started with Product Management",
        metaDesc: "A beginner's guide to product management fundamentals.",
        readTime: 6,
        thumbnailSrc: "",
        thumbnailAlt: "",
        type: "published",
        placement: "blog",
        faqs: JSON.stringify([]),
        featured: true,
        url: "getting-started-with-product-management",
        version: 2,
        recommended: true,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "10 Leadership Lessons Every PM Should Know",
        author: "Super Admin",
        publishedDate: now,
        category: "Leadership",
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Dummy content." }] },
          ],
        }),
        metaTitle: "10 Leadership Lessons",
        metaDesc: "Lessons on leading product teams effectively.",
        readTime: 8,
        thumbnailSrc: "",
        thumbnailAlt: "",
        type: "published",
        placement: "blog",
        faqs: JSON.stringify([]),
        featured: false,
        url: "10-leadership-lessons",
        version: 2,
        recommended: false,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "The Future of AI in Product Management",
        author: "Super Admin",
        publishedDate: now,
        category: "AI",
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Dummy content." }] },
          ],
        }),
        metaTitle: "The Future of AI in PM",
        metaDesc: "How AI is reshaping the product manager's toolkit.",
        readTime: 5,
        thumbnailSrc: "",
        thumbnailAlt: "",
        type: "scheduled",
        placement: "blog",
        faqs: JSON.stringify([]),
        featured: false,
        url: "future-of-ai-in-product-management",
        version: 2,
        recommended: false,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Notes on Growth (Draft)",
        author: "Super Admin",
        publishedDate: now,
        category: "Growth",
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Work in progress." }] },
          ],
        }),
        metaTitle: "",
        metaDesc: "",
        readTime: 3,
        thumbnailSrc: "",
        thumbnailAlt: "",
        type: "draft",
        placement: "blog",
        faqs: JSON.stringify([]),
        featured: false,
        url: "notes-on-growth-draft",
        version: 2,
        recommended: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ── Platform Leads ────────────────────────────────────────────────
    await queryInterface.bulkInsert(t("platform_leads"), [
      {
        name: "Amit Sharma",
        email: "amit.sharma@example.com",
        phone: "9876500001",
        type: "ai-for-pm-enrollments",
        status: "Positive",
        assignedTo: "Ishaan",
        additionalData: JSON.stringify({}),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Priya Singh",
        email: "priya.singh@example.com",
        phone: "9876500002",
        type: "ai-for-pm-download-curriculum",
        status: "Hot Lead",
        assignedTo: "Ishaan",
        additionalData: JSON.stringify({}),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Rahul Verma",
        email: "rahul.verma@example.com",
        phone: "9876500003",
        type: "pm-fellowship-enrollments",
        status: "Next Cohort",
        assignedTo: null,
        additionalData: JSON.stringify({}),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Sneha Gupta",
        email: "sneha.gupta@example.com",
        phone: "9876500004",
        type: "pm-fellowship-download-curriculum",
        status: "Paid",
        assignedTo: null,
        additionalData: JSON.stringify({}),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Karan Mehta",
        email: "karan.mehta@example.com",
        phone: "9876500005",
        type: "ai-for-pm-scholarship",
        status: "Not interested",
        assignedTo: "Ishaan",
        additionalData: JSON.stringify({}),
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Divya Nair",
        email: "divya.nair@example.com",
        phone: "9876500006",
        type: "pm-fellowship-enrollments",
        status: "Positive",
        assignedTo: null,
        additionalData: JSON.stringify({}),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ── Contacts (list + details) ────────────────────────────────────
    const contactListId = "11111111-1111-1111-1111-111111111111";
    await queryInterface.bulkInsert(t("ContactLists"), [
      {
        id: contactListId,
        name: "Newsletter Subscribers",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert(t("ContactDetails"), [
      {
        id: "22222222-2222-2222-2222-222222222221",
        contactListId,
        name: "Neha Kapoor",
        email: "neha.kapoor@example.com",
        phone: "9876500011",
        createdAt: now,
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        contactListId,
        name: "Arjun Rao",
        email: "arjun.rao@example.com",
        phone: "9876500012",
        createdAt: now,
      },
      {
        id: "22222222-2222-2222-2222-222222222223",
        contactListId,
        name: "Meera Iyer",
        email: "meera.iyer@example.com",
        phone: "9876500013",
        createdAt: now,
      },
    ]);

    // ── Campaigns ─────────────────────────────────────────────────────
    const campaignSentId = ulid();
    const campaignDraftId = ulid();
    await queryInterface.bulkInsert(t("campaigns"), [
      {
        id: campaignDraftId,
        name: "Welcome Series - Sept",
        type: "email",
        status: "draft",
        sender_name: "Rich Harbor",
        sender_email: null,
        subject: "Welcome to Rich Harbor!",
        content: "<p>Hi {{name}}, welcome aboard.</p>",
        recipient_filters: JSON.stringify({
          type: "contact_list",
          filters: { contactListId },
        }),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: campaignSentId,
        name: "Product Launch Announcement",
        type: "email",
        status: "sent",
        sender_name: "Rich Harbor",
        sender_email: null,
        subject: "We just launched something new",
        content: "<p>Hi {{name}}, check out our latest launch.</p>",
        recipient_filters: JSON.stringify({
          type: "contact_list",
          filters: { contactListId },
        }),
        sent_at: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // ── Unsubscribes ──────────────────────────────────────────────────
    await queryInterface.bulkInsert(t("unsubscribes"), [
      {
        id: ulid(),
        email: "opted.out1@example.com",
        campaignId: campaignSentId,
        reason: "Not interested anymore",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: ulid(),
        email: "opted.out2@example.com",
        campaignId: null,
        reason: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    const schema = getSchema();
    const t = (name) => ({ tableName: name, schema });
    await queryInterface.bulkDelete(t("unsubscribes"), null, {});
    await queryInterface.bulkDelete(t("campaigns"), null, {});
    await queryInterface.bulkDelete(t("ContactDetails"), null, {});
    await queryInterface.bulkDelete(t("ContactLists"), null, {});
    await queryInterface.bulkDelete(t("platform_leads"), null, {});
    await queryInterface.bulkDelete(t("blogs"), null, {});
  },
};
