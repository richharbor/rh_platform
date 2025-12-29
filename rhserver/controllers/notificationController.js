const { NotifySubs } = require("../models");
const { Op, Sequelize } = require("sequelize");


const saveSubscription = async (req, res) => {
    const { user } = req;

    try {
        const subscription = req.body;
        const endpoint = subscription?.endpoint;

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                message: "Missing subscription endpoint",
            });
        }

        // 🔍 Check existing subscription by endpoint (inside JSONB)
        const existingSub = await NotifySubs.findOne({
            where: {
                subscription: {
                    endpoint: endpoint
                }
            }
        });

        if (existingSub) {
            return res.status(200).json({
                success: true,
                message: "Subscription already exists",
            });
        }

        // 🔥 Create new subscription
        await NotifySubs.create({
            franchiseId: user.franchiseId,
            userId: user.id,
            subscription: subscription,
            tier: user.tier,
        });

        return res.status(201).json({
            success: true,
            message: "Subscription saved successfully.",
        });
    } catch (error) {
        console.error("Error in saving subscription:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save subscription.",
            error: error.message,
        });
    }
};


module.exports = {
    saveSubscription

};