const cron = require("node-cron");
const { Op } = require("sequelize");

// node-cron replacement for tps-next-backend's jobs/blogScheduler.js, which
// used Agenda+MongoDB to schedule a one-off "publish-blog" job per blog.
// This build has no job queue, so instead of scheduling a timer per blog,
// blogController.js's schedulePublish just stores `type: "scheduled"` +
// `scheduledAt` on the row, and this poller sweeps for rows that are due
// and flips them to published — the same end effect as source's
// agenda.define("publish-blog", ...) handler, run on an interval instead
// of at an exact timestamp.
console.log("[blogPublishScheduler] scheduler loaded");

const runDuePublishes = async () => {
  const { blog: Blog } = require("../models");

  const now = new Date();

  const [affectedCount] = await Blog.update(
    {
      type: "published",
      publishedAt: now,
      scheduledAt: null,
    },
    {
      where: {
        type: "scheduled",
        scheduledAt: { [Op.lte]: now },
      },
    }
  );

  if (affectedCount > 0) {
    console.log(`[blogPublishScheduler] published ${affectedCount} scheduled blog(s)`);
  }

  return affectedCount;
};

if (process.env.BLOG_PUBLISH_CRON_ENABLED !== "false") {
  const schedule = process.env.BLOG_PUBLISH_CRON_SCHEDULE || "* * * * *";

  cron.schedule(schedule, async () => {
    try {
      await runDuePublishes();
    } catch (error) {
      console.error("[blogPublishScheduler] run failed:", error.message);
    }
  });

  console.log(`[blogPublishScheduler] started (schedule: "${schedule}")`);
} else {
  console.log("[blogPublishScheduler] disabled via BLOG_PUBLISH_CRON_ENABLED=false");
}

module.exports = { runDuePublishes };
