const { User, Notification } = require("../models");
// Use FCM service for direct Firebase messaging with image support
const notificationService = require("../services/fcmNotificationService");

/**
 * Save Expo Push Token for the authenticated user
 */
const savePushToken = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user.id;

        if (!token) return res.status(400).json({ error: "Token is required" });

        await User.update({ push_token: token }, { where: { id: userId } });
        console.log(`[Notification] Saved FCM token for user ${userId}`);

        res.json({ success: true, message: "Token saved" });
    } catch (error) {
        console.error("Save Token Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Admin Broadcast - Now uses FCM directly
 */
const broadcast = async (req, res) => {
    try {
        const { title, body, data, imageUrl } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: "Title and body are required" });
        }

        const result = await notificationService.broadcastNotification(title, body, data, imageUrl);
        res.json({ success: true, result });
    } catch (error) {
        console.error("Broadcast Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'body', 'type', 'image_url', 'is_new', 'created_at']
        });
        res.json({ success: true, notifications });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ error: error.message });
    }
}

const updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        notification.is_new = false;
        await notification.save();

        res.json({ success: true, notification });
    } catch (error) {
        console.error("Update Notification Error:", error);
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    savePushToken,
    broadcast,
    getNotifications,
    updateNotification
};
