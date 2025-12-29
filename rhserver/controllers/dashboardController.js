const { Shares, Sells, Transactions } = require("../models");
const { Op } = require("sequelize");

const getInfo = async (req, res) => {
    const { user } = req;
    try {
        const shareCount = await Shares.count({
            where: { franchiseId: user.franchiseId }
        });
        const sellCount = await Sells.count({
            where: { userId: user.id }
        })
        const transactions = await Transactions.findAll({
            where: {
                [Op.or]: [
                    { buyerId: user.id },
                    { sellerId: user.id }
                ]
            },
            order: [
                ['createdAt', 'DESC']
            ]
        });
        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched.",
            data: {
                shareCount,
                sellCount,
                transactions
            }
        });



    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }


};


module.exports = {
    getInfo,

};