const { sendWhatsAppTestMessage } = require("../utils/sendWhatsappMsg");

const sendMessage = async (req, res) => {
    const { title, description, phoneNumbers } = req.body;

    try {
        for (const phoneNumber of phoneNumbers) {
            await sendWhatsAppTestMessage(title, description, phoneNumber);
        }
        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Message sent failed",
            error: error.message
        });
    }
}

module.exports = {
    sendMessage,
}
