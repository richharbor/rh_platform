const { Incentive, Lead } = require("../models");
const { Op } = require("sequelize");

// Get Wallet Stats (Total, Pending, Paid)
const getWalletStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const incentives = await Incentive.findAll({
            where: { user_id: userId },
            attributes: ['amount', 'status']
        });

        const totalEarned = incentives.reduce((sum, item) => sum + (item.amount || 0), 0);

        const pending = incentives
            .filter(i => i.status === 'pending')
            .reduce((sum, item) => sum + (item.amount || 0), 0);

        const paid = incentives
            .filter(i => i.status === 'paid')
            .reduce((sum, item) => sum + (item.amount || 0), 0);

        res.json({
            totalEarned,
            pending,
            paid,
            currency: 'INR'
        });
    } catch (error) {
        console.error("Get wallet stats error:", error);
        res.status(500).json({ error: "Failed to fetch wallet stats" });
    }
};

// Get Transaction History
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Incentive.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            limit: 50,
            include: [
                {
                    model: Lead,
                    as: 'lead',
                    attributes: ['id', 'name', 'product_type']
                }
            ]
        });

        res.json(transactions);
    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({ error: "Failed to fetch transactions" });
    }
};

module.exports = {
    getWalletStats,
    getTransactions
};
