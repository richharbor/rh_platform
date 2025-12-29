const { sendEmail } = require("../utils/sendEmail.js");

// POST /api/email/send
const sendEmailController = async (req, res) => {
    const { to, subject, content, isHtml } = req.body;

    if (!to || !subject || !content) {
        return res.status(400).json({ error: "to, subject, and content are required" });
    }

    try {
        await sendEmail(to, subject, content, isHtml);
        res.status(200).json({ status: "SUCCESS", message: "Email sent successfully" });
    } catch (error) {
        console.error("Error in sendEmailController:", error);
        res.status(500).json({ status: "ERROR", message: "Failed to send email" });
    }
};

module.exports = {
    sendEmailController,
};
