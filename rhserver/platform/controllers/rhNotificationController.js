const { User } = require("../models");
const notificationService = require("../services/notificationService");

/**
 * Save Expo Push Token for the authenticated user
 */
const savePushToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        if (!token) return res.status(400).json({ error: "Token is required" });

        await User.update({ push_token: token }, { where: { id: userId } });
        console.log(`[Notification] Saved token for user ${userId}`);

        res.json({ success: true, message: "Token saved" });
    } catch (error) {
        console.error("Save Token Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Admin Broadcast
 */
const broadcast = async (req, res) => {
    try {
        const { title, body, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: "Title and body are required" });
        }

        const result = await notificationService.broadcastNotification(title, body, data);
        res.json({ success: true, result });
    } catch (error) {
        console.error("Broadcast Error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    savePushToken,
    broadcast
};
