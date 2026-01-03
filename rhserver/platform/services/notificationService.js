const { Expo } = require('expo-server-sdk');
const { User, Sequelize } = require('../models');
const { Op } = Sequelize;

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

/**
 * Send push notifications to a list of users
 * @param {Array<string>} userIds - List of User IDs to notify
 * @param {string} title - Notification Title
 * @param {string} body - Notification Body
 * @param {Object} data - Extra data payload
 */
const sendPushNotification = async (userIds, title, body, data = {}) => {
    try {
        // 1. Fetch users with push tokens
        const users = await User.findAll({
            where: {
                id: userIds,
                push_token: { [Op.ne]: null } // Only users with tokens
            },
            attributes: ['id', 'push_token']
        });

        const messages = [];
        for (const user of users) {
            // Check if token is valid
            if (!Expo.isExpoPushToken(user.push_token)) {
                console.error(`Push token ${user.push_token} is not a valid Expo push token`);
                continue;
            }

            messages.push({
                to: user.push_token,
                sound: 'default',
                title: title,
                body: body,
                data: { ...data, userId: user.id },
            });
        }

        // 2. Chunk and Send
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error("Error sending notification chunk", error);
            }
        }

        // 3. Handle Errors (Optional: remove invalid tokens)
        // ... (We can implement receipt checking later if needed)

        console.log(`[Notification] Sent ${messages.length} notifications`);
        return tickets;

    } catch (error) {
        console.error("[Notification Service Error]", error);
        return [];
    }
};

/**
 * Send to ALL users with tokens (Broadcast)
 */
const broadcastNotification = async (title, body, data = {}) => {
    try {
        const users = await User.findAll({
            where: { push_token: { [Op.ne]: null } },
            attributes: ['push_token']
        });

        const pushTokens = users.map(u => u.push_token).filter(t => Expo.isExpoPushToken(t));

        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data
        }));

        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
        }
        return { count: messages.length };
    } catch (error) {
        console.error("Broadcast Error", error);
        return { error: error.message };
    }
};

module.exports = {
    sendPushNotification,
    broadcastNotification
};
