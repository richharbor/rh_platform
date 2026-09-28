const nodemailer = require("nodemailer");

// Single Google SMTP identity for all outbound mail (invite emails +
// marketing campaign sends). No AWS SES, no Microsoft Graph, no
// multi-provider routing — see service/email/sendEmail.js.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;
