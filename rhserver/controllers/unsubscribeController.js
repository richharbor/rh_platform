"use strict";

const { Op } = require("sequelize");
const {
  verifyUnsubscribeToken,
} = require("../service/email/unsubscribeToken");
const { Unsubscribe } = require("../models");
const { getPaginationParams, getMeta } = require("../utils/pagination");

// Simplified from tps-next-backend's
// controllers/emailUnsubscribe/emailUnsubscribe.controller.js: source's
// unsubscribeUser() writes to `lead_consent` (canonical) + dual-writes to
// legacy `unsubscribes` + syncs `NewsletterEmail` status — all in support
// of the (out-of-scope) workflow engine + newsletter module. This build has
// neither, so `unsubscribes` is the single, canonical write target.
// getUnsubscribedUsers() similarly reads straight from `unsubscribes`
// instead of `lead_consent`, with real pagination/search added since this
// is now the sole admin listing source (source's version returned every
// row un-paginated).

// PUBLIC — hit by the unsubscribe link in a sent campaign email. No
// `authenticate` middleware (see routes/unsubscribeRoutes.js).
exports.unsubscribeUser = async (req, res) => {
  try {
    const { token, reason } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const data = verifyUnsubscribeToken(token);
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired unsubscribe link",
      });
    }

    const email = (data.email || "").trim().toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Token missing email" });
    }

    const optOutReason = reason || "user_unsubscribed_via_campaign";

    const [row, created] = await Unsubscribe.findOrCreate({
      where: { email },
      defaults: {
        email,
        campaignId: data.campaignId || null,
        reason: optOutReason,
      },
    });

    return res.status(200).json({
      success: true,
      message: created
        ? "You have been unsubscribed successfully"
        : "You are already unsubscribed",
      unsubscribe: row,
    });
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ADMIN — list/search/paginate the Unsubscribed admin page. Behind
// requirePermission('marketing', 'manage_unsubscribes').
exports.getUnsubscribedUsers = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query, 20, 200);
    const { search } = req.query;

    const where = {};
    if (search) {
      where.email = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Unsubscribe.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: rows,
      meta: getMeta(count, page, limit),
    });
  } catch (error) {
    console.error("Error fetching unsubscribed users:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// ADMIN — export the full unsubscribed list (no pagination) as JSON for
// client-side CSV/XLSX export in the admin panel.
exports.exportUnsubscribedUsers = async (req, res) => {
  try {
    const rows = await Unsubscribe.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error exporting unsubscribed users:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
