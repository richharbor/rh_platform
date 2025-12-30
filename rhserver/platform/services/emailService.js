const nodemailer = require("nodemailer");

// Check if email configuration exists
const isEmailConfigured = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

let transporter = null;

if (isEmailConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    console.log("✅ Email service configured");
} else {
    console.warn("⚠️  Email service not configured - emails will be logged to console only");
}

const sendEmail = async (to, subject, content, isHtml = true) => {
    // If email is not configured, just log to console
    if (!transporter) {
        console.log("\n------- EMAIL (Not Sent - No Config) -------");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${isHtml ? '[HTML Email]' : content}`);
        console.log("--------------------------------------------\n");
        return { messageId: 'mock-' + Date.now() };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            [isHtml ? "html" : "text"]: content,
        });
        console.log("✅ Email sent: " + info.response);
        return info;
    } catch (error) {
        console.error("❌ Error sending email: ", error.message);
        throw error;
    }
};

module.exports = {
    sendEmail
};
