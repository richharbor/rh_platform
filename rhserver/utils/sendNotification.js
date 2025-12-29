const webpush = require("web-push");
const { NotifySubs } = require("../models");
const { Op } = require("sequelize");

webpush.setVapidDetails(
    "mailto:frontend@rhinontech.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const sendBookingNotification = async (franchiseId, firstName, lastName) => {
    const notifySubs = await NotifySubs.findAll({
        where: {
            franchiseId: franchiseId,
            tier: 3,
        }
    })

    if (!notifySubs.length) {
        return;
    }

    const payload = JSON.stringify({
        title: "New Booking",
        body: `${firstName} ${lastName} Booked a share`
    });

    // Send to each subscription
    for (const sub of notifySubs) {
        try {
            await webpush.sendNotification(sub.subscription, payload);
        } catch (err) {
            console.error("Push error for subscription:", sub.id, err.message);

            // OPTIONAL: remove invalid subscription (expired or revoked)
            if (err.statusCode === 410 || err.statusCode === 404) {
                await sub.destroy();
            }
        }
    }
}
const sendBidingNotification = async (franchiseId, firstName, lastName) => {
    const notifySubs = await NotifySubs.findAll({
        where: {
            franchiseId: franchiseId,
            tier: 3,
        }
    })

    if (!notifySubs.length) {
        return;
    }

    const payload = JSON.stringify({
        title: "New Biding",
        body: `${firstName} ${lastName} bid a share`
    });

    // Send to each subscription
    for (const sub of notifySubs) {
        try {
            await webpush.sendNotification(sub.subscription, payload);
        } catch (err) {
            console.error("Push error for subscription:", sub.id, err.message);

            // OPTIONAL: remove invalid subscription (expired or revoked)
            if (err.statusCode === 410 || err.statusCode === 404) {
                await sub.destroy();
            }
        }
    }
}
const sendBestDealNotification = async (userId, franchiseId, shareName) => {
    const notifySubs = await NotifySubs.findAll({
        where: {
            franchiseId: franchiseId,
            userId: { [Op.ne]: userId }
        }
    })

    if (!notifySubs.length) {
        return;
    }

    const payload = JSON.stringify({
        title: "New Best Deal available",
        body: `${shareName} available as best deal`
    });

    // Send to each subscription
    for (const sub of notifySubs) {
        try {
            await webpush.sendNotification(sub.subscription, payload);
        } catch (err) {
            console.error("Push error for subscription:", sub.id, err.message);

            // OPTIONAL: remove invalid subscription (expired or revoked)
            if (err.statusCode === 410 || err.statusCode === 404) {
                await sub.destroy();
            }
        }
    }
}



module.exports = {
    sendBookingNotification,
    sendBidingNotification,
    sendBestDealNotification
};