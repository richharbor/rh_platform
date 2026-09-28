"use strict";

const { Op } = require("sequelize");
const { CAMPAIGN_STATUS } = require("../constants/campaign");
const { Campaign, CampaignRecipient } = require("../models");
const { getPaginationParams, getMeta } = require("../utils/pagination");

const {
  buildRecipients,
} = require("../service/campaign/campaignRecipientBuilder");

// Swapped from (source) service/mail/sendEmail.js — see
// service/email/sendEmail.js for the single-SMTP-identity replacement.
const sendEmail = require("../service/email/sendEmail");
const {
  cleanHtml,
  replacePlaceholders,
  wrapEmailTemplate,
} = require("../service/email/htmlHelpers");

const {
  filterUnsubscribedRecipients,
} = require("../service/campaign/filterUnsubscribedRecipients");

// Ported from tps-next-backend's controllers/campaign/campaign.controller.js.
// Dropped entirely (out of scope for this build): getEventsForCampaign,
// getResourcesForCampaign (Event/Resource models don't exist here).
// Dropped: agenda-backed scheduleCampaign/sendCampaignNow/cancelCampaignSchedule
// imports from jobs/campaignScheduler — replaced with plain status flips;
// jobs/campaignSendWorker.js's node-cron tick picks up SENDING/due-SCHEDULED
// campaigns on its own poll (see that file's header comment).

exports.createCampaign = async (req, res) => {
  try {
    const { name, type = "email" } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Campaign name is required",
      });
    }

    const campaign = await Campaign.create({
      name,
      type,
      status: CAMPAIGN_STATUS.DRAFT,
    });

    return res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create campaign",
    });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query, 10, 100);
    const { status, type, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Campaign.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      campaigns: rows,
      meta: getMeta(count, page, limit),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch campaigns",
    });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    return res.json({
      campaign,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch campaign",
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    const oldFilters = JSON.stringify(campaign.recipient_filters);
    const newFilters = JSON.stringify(req.body.recipient_filters);

    await campaign.update(req.body);

    /* --------------------------------
       If filters changed, rebuild recipients
    -------------------------------- */

    if (req.body.recipient_filters && oldFilters !== newFilters) {
      await CampaignRecipient.destroy({
        where: { campaign_id: id },
      });
    }

    return res.json({
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update campaign",
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    await campaign.destroy();

    return res.json({
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete campaign",
    });
  }
};

exports.schedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduled_at } = req.body;

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    /* --------------------------------
       VERIFY REQUIRED DATA
    -------------------------------- */

    if (
      !campaign.subject ||
      !campaign.content ||
      !campaign.recipient_filters
    ) {
      return res.status(400).json({
        message:
          "Campaign is incomplete. Please fill subject, content and recipient filters.",
      });
    }

    /* --------------------------------
       SEND NOW — flips status to SENDING; jobs/campaignSendWorker.js's
       node-cron tick (default every minute) picks up SENDING campaigns
       and runs the batch-claim-and-send loop against them.
    -------------------------------- */

    if (!scheduled_at) {
      await campaign.update({
        status: CAMPAIGN_STATUS.SENDING,
        scheduled_at: null,
      });

      return res.json({
        message: "Campaign queued to send",
      });
    }

    /* --------------------------------
       SCHEDULE CAMPAIGN
    -------------------------------- */

    const scheduleTime = new Date(scheduled_at);

    if (scheduleTime <= new Date()) {
      return res.status(400).json({
        message: "Scheduled time must be in the future",
      });
    }

    await campaign.update({
      status: CAMPAIGN_STATUS.SCHEDULED,
      scheduled_at: scheduleTime,
    });

    return res.json({
      message: "Campaign scheduled successfully",
      scheduled_at: scheduleTime,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to schedule campaign",
    });
  }
};

exports.cancelCampaignSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findByPk(id);

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    if (
      campaign.status !== CAMPAIGN_STATUS.SCHEDULED &&
      campaign.status !== CAMPAIGN_STATUS.SENDING
    ) {
      return res.status(400).json({
        message: "Campaign is not scheduled or sending",
      });
    }

    await campaign.update({
      status: CAMPAIGN_STATUS.DRAFT,
      scheduled_at: null,
    });

    return res.json({ message: "Campaign scheduling cancelled" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to cancel campaign schedule",
    });
  }
};

exports.previewRecipients = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const recipients = await buildRecipients(campaign.recipient_filters);
    const filteredRecipients = await filterUnsubscribedRecipients(recipients);

    return res.json({
      campaign,
      recipientsCount: recipients.length,
      recipients: filteredRecipients,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to preview recipients",
    });
  }
};

exports.sendTestMail = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const campaign = await Campaign.findByPk(req.params.id);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const cleanedBody = cleanHtml(campaign.content || "");

    const subject = replacePlaceholders(campaign.subject || "", { name });
    const body = replacePlaceholders(cleanedBody, { name });

    const htmlContent = wrapEmailTemplate(body);

    const result = await sendEmail({
      to: email,
      subject,
      html: htmlContent,
      from: campaign.sender_email,
      fromName: campaign.sender_name,
      meta: {
        source: "CAMPAIGN",
        sourceId: campaign.id,
        sourceName: `Test: ${campaign.name || campaign.subject || "Campaign"}`,
        extra: { isTest: true },
      },
    });

    if (result !== "success") {
      return res.status(500).json({ message: "Failed to send test email" });
    }

    return res.json({ message: "Test email sent" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to send test email",
    });
  }
};
