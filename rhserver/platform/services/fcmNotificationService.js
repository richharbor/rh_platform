const admin = require('firebase-admin');
const { User, Sequelize } = require('../models');
const { Op } = Sequelize;

// Initialize Firebase Admin SDK (only once)
let firebaseInitialized = false;

/**
 * Convert all data payload values to strings (FCM requirement)
 */
const stringifyDataPayload = (data) => {
    if (!data || typeof data !== 'object') return {};

    const stringifiedData = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
            continue; // Skip null/undefined
        }
        stringifiedData[key] = String(value);
    }
    return stringifiedData;
};

const initializeFirebase = () => {
    if (firebaseInitialized) return;

    try {
        // You need to get the service account JSON from Firebase Console
        // Go to: Project Settings > Service Accounts > Generate New Private Key
        const serviceAccount = require('../../firebase-service-account.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseInitialized = true;
        console.log('[FCM] Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('[FCM] Failed to initialize Firebase Admin SDK:', error.message);
        throw error;
    }
};

/**
 * Send push notifications to specific users via FCM
 * @param {Array<string>} userIds - List of User IDs to notify
 * @param {string} title - Notification Title
 * @param {string} body - Notification Body  
 * @param {Object} data - Extra data payload
 * @param {string} image - Image URL (optional)
 */
const sendPushNotification = async (userIds, title, body, data = {}, image = null) => {
    try {
        initializeFirebase();

        // Fetch users with FCM tokens
        const users = await User.findAll({
            where: {
                id: userIds,
                push_token: { [Op.ne]: null }
            },
            attributes: ['id', 'push_token']
        });

        if (users.length === 0) {
            console.log('[FCM] No users with push tokens found');
            return [];
        }

        const tokens = users.map(u => u.push_token);

        // Construct FCM message with Android-specific BigPicture configuration
        const androidNotification = {
            channelId: 'rich-harbor-v2',
            sound: 'default',
            priority: 'max',
            defaultVibrateTimings: true
        };

        // Only add imageUrl if image is provided and valid
        if (image && image.trim() !== '') {
            // Encode URL to handle spaces and special characters
            androidNotification.imageUrl = encodeURI(image.trim());
        }

        const message = {
            notification: {
                title: title,
                body: body
            },
            data: stringifyDataPayload({
                ...data,
                ...(image && { image: image })
            }),
            android: {
                priority: 'high',
                notification: androidNotification
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        'mutable-content': 1
                    }
                },
                fcm_options: {
                    ...(image && { image: image })
                }
            },
            tokens: tokens
        };

        console.log('[FCM] Sending notification to', tokens.length, 'devices');
        console.log('[FCM] Payload:', JSON.stringify({ ...message, tokens: ['...'] }, null, 2));

        // Send to multiple devices
        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`[FCM] Successfully sent ${response.successCount} notifications`);
        if (response.failureCount > 0) {
            console.error(`[FCM] Failed to send ${response.failureCount} notifications`);
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`[FCM] Error for token ${tokens[idx]}:`, resp.error);
                }
            });
        }

        return response;
    } catch (error) {
        console.error('[FCM Service Error]', error);
        return { successCount: 0, failureCount: 0, error: error.message };
    }
};

/**
 * Broadcast notification to ALL users with push tokens
 */
const broadcastNotification = async (title, body, data = {}, image = null) => {
    try {
        initializeFirebase();

        const users = await User.findAll({
            where: { push_token: { [Op.ne]: null } },
            attributes: ['push_token']
        });

        if (users.length === 0) {
            return { successCount: 0, message: 'No users with push tokens' };
        }

        const tokens = users.map(u => u.push_token);

        // Construct FCM message with Android BigPicture support
        const androidNotification = {
            channelId: 'rich-harbor-v2',
            sound: 'default',
            priority: 'max',
            defaultVibrateTimings: true
        };

        // Only add imageUrl if image is provided and valid
        if (image && image.trim() !== '') {
            // Encode URL to handle spaces and special characters
            androidNotification.imageUrl = encodeURI(image.trim());
        }

        const message = {
            notification: {
                title: title,
                body: body
            },
            data: stringifyDataPayload({
                ...data,
                ...(image && { image: image })
            }),
            android: {
                priority: 'high',
                notification: androidNotification
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        'mutable-content': 1
                    }
                },
                fcm_options: {
                    ...(image && { image: image })
                }
            },
            tokens: tokens
        };

        console.log(`[FCM] Broadcasting to ${tokens.length} devices`);

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`[FCM] Broadcast complete: ${response.successCount} successful, ${response.failureCount} failed`);

        // Log detailed errors
        if (response.failureCount > 0) {
            console.error(`[FCM] Failed to send ${response.failureCount} notifications:`);
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`[FCM] Token ${idx + 1}:`, tokens[idx]);
                    console.error(`[FCM] Error:`, resp.error?.message || resp.error);
                }
            });
        }


        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            totalDevices: tokens.length
        };
    } catch (error) {
        console.error('[FCM Broadcast Error]', error);
        return { error: error.message };
    }
};

module.exports = {
    sendPushNotification,
    broadcastNotification
};
