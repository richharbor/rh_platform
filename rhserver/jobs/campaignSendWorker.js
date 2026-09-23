// node-cron replacement for tps-next-backend's jobs/campaignScheduler.js
// (Agenda + MongoDB backed).
//
// Split of source file:
//  - Agenda-specific wrapper code — DROPPED: `agenda.define("send-campaign", ...)`
//    job registration, `agenda.schedule(...)`/`agenda.now(...)`/`agenda.cancel(...)`
//    dispatch functions, and Agenda's own job-level retry
//    (`job.attrs.failCount` / `job.schedule("in 2 minutes")`).
//  - Actual business logic — KEPT close to verbatim: build recipients (once,
//    if none exist yet), then the Postgres-transaction batch-claim-and-send
//    loop (claim a batch of PENDING recipients under `FOR UPDATE`, flip them
//    to PROCESSING, send each one, flip to SENT/FAILED). That loop has no
//    Agenda dependency in source and is preserved as-is here.
//
// Dispatch model: the campaign controller no longer calls `agenda.now`/
// `agenda.schedule` — it just flips `campaign.status` to SENDING (send-now)
// or SCHEDULED (with `scheduled_at` in the future). This cron tick, running
// every `CAMPAIGN_SEND_CRON_SCHEDULE` (default every minute), picks up:
//   - campaigns already SENDING (a send-now request that hasn't been
//     processed by a tick yet, or one that got interrupted mid-batch), and
//   - campaigns SCHEDULED whose scheduled_at is due,
// and runs the same processing routine against each.
const cron = require("node-cron");
const { Op } = require("sequelize");
const { Campaign, CampaignRecipient, sequelize } = require("../models");
const {
  CAMPAIGN_STATUS,
  CAMPAIGN_RECIPIENT_STATUS,
} = require("../constants/campaign");

const sendEmail = require("../service/email/sendEmail");
const {
  generateUnsubscribeToken,
} = require("../service/email/unsubscribeToken");

const {
  wrapEmailTemplateWithUnsubscribe,
  cleanHtml,
  replacePlaceholders,
} = require("../service/email/htmlHelpers");
const { capitalizeName } = require("../utils/capitalize");
const {
  buildRecipients,
} = require("../service/campaign/campaignRecipientBuilder");
const {
  filterUnsubscribedRecipients,
} = require("../service/campaign/filterUnsubscribedRecipients");

const BATCH_SIZE = parseInt(process.env.CAMPAIGN_BATCH_SIZE, 10) || 50;
const SEND_INTERVAL_MS =
  parseInt(process.env.CAMPAIGN_SEND_INTERVAL_MS, 10) || 0;

const isDev = process.env.NODE_ENV !== "production";
const log = (...args) => isDev && console.log("[Campaign Worker]", ...args);
const logError = (...args) =>
  isDev && console.error("[Campaign Worker ERROR]", ...args);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------
   BUSINESS LOGIC — ported ~verbatim from
   tps-next-backend's jobs/campaignScheduler.js
   `agenda.define("send-campaign", ...)` handler
------------------------------------------ */
async function processCampaign(campaignId) {
  log(`Processing campaignId: ${campaignId}`);

  const campaign = await Campaign.findByPk(campaignId);

  if (!campaign) {
    log(`Campaign ${campaignId} not found, skipping.`);
    return;
  }

  /* --------------------------------
     VERIFY REQUIRED DATA
  -------------------------------- */
  if (
    !campaign.subject ||
    !campaign.content ||
    !campaign.recipient_filters
  ) {
    logError(`Campaign ${campaignId} missing required fields, marking FAILED.`);
    await campaign.update({ status: CAMPAIGN_STATUS.FAILED });
    return;
  }

  const existingRecipients = await CampaignRecipient.count({
    where: { campaign_id: campaignId },
  });

  if (!existingRecipients) {
    log(`Building recipients from filters for campaign ${campaignId}...`);

    const recipients = await buildRecipients(campaign.recipient_filters);
    const filteredRecipients = await filterUnsubscribedRecipients(recipients);

    if (!filteredRecipients?.length) {
      logError(`No recipients found for campaign ${campaignId}, marking FAILED.`);
      await campaign.update({ status: CAMPAIGN_STATUS.FAILED });
      return;
    }

    await CampaignRecipient.bulkCreate(
      filteredRecipients.map((r) => ({
        campaign_id: campaignId,
        email: r.email,
        name: r.name,
        phone: r.phone,
        source_type: r.source_type,
        source_id: r.source_id,
        status: CAMPAIGN_RECIPIENT_STATUS.PENDING,
      })),
    );

    log(`${filteredRecipients.length} recipients inserted for campaign ${campaignId}.`);
  }

  /* --------------------------------
     UPDATE STATUS
  -------------------------------- */
  if (campaign.status !== CAMPAIGN_STATUS.SENDING) {
    await campaign.update({ status: CAMPAIGN_STATUS.SENDING });
  }

  /* --------------------------------
     SEND EMAILS IN BATCHES
     (Postgres-transaction batch-claim-and-send loop, kept verbatim)
  -------------------------------- */
  const cleanedBody = cleanHtml(campaign.content);
  let batchNumber = 0;
  let totalSent = 0;
  let totalFailed = 0;

  while (true) {
    // Claim batch
    const recipients = await sequelize.transaction(async (t) => {
      const rows = await CampaignRecipient.findAll({
        where: {
          campaign_id: campaignId,
          status: CAMPAIGN_RECIPIENT_STATUS.PENDING,
        },
        limit: BATCH_SIZE,
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!rows.length) return [];

      await CampaignRecipient.update(
        { status: CAMPAIGN_RECIPIENT_STATUS.PROCESSING },
        {
          where: { id: rows.map((r) => r.id) },
          transaction: t,
        },
      );

      return rows;
    });

    if (!recipients.length) {
      log(`No more pending recipients for campaign ${campaignId}. Done.`);
      break;
    }

    batchNumber++;
    log(`Batch #${batchNumber}: processing ${recipients.length} recipients for campaign ${campaignId}...`);

    for (const recipient of recipients) {
      try {
        const recipientName = capitalizeName(recipient.name || "User");
        const personalizedSubject = replacePlaceholders(campaign.subject, {
          name: recipientName,
        });

        const personalizedBody = replacePlaceholders(cleanedBody, {
          name: recipientName,
        });

        const token = generateUnsubscribeToken(recipient.email, campaign.id);
        const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?token=${token}&type=campaign`;

        const htmlContent = wrapEmailTemplateWithUnsubscribe(
          personalizedBody,
          unsubscribeUrl,
        );

        const result = await sendEmail({
          to: recipient.email,
          subject: personalizedSubject,
          html: htmlContent,
          from: campaign.sender_email,
          fromName: campaign.sender_name,
          meta: {
            source: "CAMPAIGN",
            sourceId: campaign.id,
            sourceName: campaign.name || campaign.subject || "Campaign Broadcast",
            extra: { recipientId: recipient.id, campaignType: campaign.type },
          },
        });

        if (result === "success") {
          await recipient.update({
            status: CAMPAIGN_RECIPIENT_STATUS.SENT,
            sent_at: new Date(),
          });

          totalSent++;
          log(`Sent -> ${recipient.email}`);
        } else {
          throw new Error("Failure from email provider");
        }
      } catch (error) {
        await recipient.update({
          status: CAMPAIGN_RECIPIENT_STATUS.FAILED,
          error: error.message,
        });

        totalFailed++;
        logError(`Failed -> ${recipient.email} | Reason: ${error.message}`);
      }

      if (SEND_INTERVAL_MS > 0) {
        await sleep(SEND_INTERVAL_MS);
      }
    }

    log(`Batch #${batchNumber} done. Sent: ${totalSent} | Failed: ${totalFailed}`);
  }

  /* --------------------------------
     MARK CAMPAIGN SENT
  -------------------------------- */
  await campaign.update({
    status: CAMPAIGN_STATUS.SENT,
    sent_at: new Date(),
  });
  log(`Campaign ${campaignId} complete. Total sent: ${totalSent}, failed: ${totalFailed}`);
}

/* ------------------------------------------
   CRON TICK
------------------------------------------ */
let running = false;

async function tick() {
  if (running) {
    log("Previous tick still running, skipping this tick.");
    return;
  }

  running = true;
  try {
    const now = new Date();

    const dueCampaigns = await Campaign.findAll({
      where: {
        [Op.or]: [
          { status: CAMPAIGN_STATUS.SENDING },
          {
            status: CAMPAIGN_STATUS.SCHEDULED,
            scheduled_at: { [Op.lte]: now },
          },
        ],
      },
    });

    for (const campaign of dueCampaigns) {
      try {
        await processCampaign(campaign.id);
      } catch (error) {
        logError(`Unhandled error processing campaign ${campaign.id}:`, error.message);
        await Campaign.update(
          { status: CAMPAIGN_STATUS.FAILED },
          { where: { id: campaign.id } },
        );
      }
    }
  } catch (error) {
    logError("Tick failed:", error.message);
  } finally {
    running = false;
  }
}

if (process.env.CAMPAIGN_SEND_CRON_ENABLED !== "false") {
  const schedule = process.env.CAMPAIGN_SEND_CRON_SCHEDULE || "* * * * *";
  cron.schedule(schedule, () => {
    tick().catch((err) => logError("Tick threw:", err.message));
  });
  log(`Campaign send cron scheduled: ${schedule}`);
} else {
  log("Campaign send cron disabled via CAMPAIGN_SEND_CRON_ENABLED=false");
}

module.exports = { processCampaign, tick };
