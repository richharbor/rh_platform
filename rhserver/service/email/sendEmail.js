const transporter = require("../../config/mailer");

// Replacement for tps-next-backend's service/mail/sendEmail.js. That file
// routed through a multi-provider PROVIDERS map (AWS SES + Microsoft Graph,
// keyed by literal sender-address strings). This build has exactly one
// outbound identity — a single Google SMTP account — so the provider
// routing is gone entirely; `from`/`fromName` on the call become display
// name / reply-to hints only, the actual SMTP envelope-from is always
// EMAIL_USER.
//
// Signature and return value are kept identical to the source so campaign
// send code ports over unchanged: async ({ to, subject, html, from,
// fromName, meta }) => "success" | "failed".
async function sendEmail({ to, subject, html, from, fromName, meta }) {
  try {
    if (!to || !subject || !html) {
      console.error("sendEmail: missing required field(s)", { to, subject, meta });
      return "failed";
    }

    const envelopeFrom = process.env.EMAIL_USER;
    const displayName = fromName || "Rich Harbor";
    const replyTo = from && from.includes("@") ? from : envelopeFrom;

    await transporter.sendMail({
      from: `"${displayName}" <${envelopeFrom}>`,
      replyTo,
      to,
      subject,
      html,
    });

    return "success";
  } catch (error) {
    console.error("Email sending failed:", error, { meta });
    return "failed";
  }
}

module.exports = sendEmail;
