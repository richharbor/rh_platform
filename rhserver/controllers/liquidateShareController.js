const { LiquidateShare } = require('../models');

module.exports = {
    // GET /api/liquidate-shares
    async getAll(req, res) {
        try {
            const shares = await LiquidateShare.findAll();
            res.json(shares);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch records' });
        }
    },

    // POST /api/liquidate-shares
    async create(req, res) {
        try {
            const { email, fullName, phone, price, profile, quantity, shareName } =
                req.body;

            const newShare = await LiquidateShare.create({
                email,
                fullName,
                phone,
                price,
                profile,
                quantity,
                shareName,
            });

            res.status(201).json(newShare);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: 'Failed to create record', details: err });
        }
    },
};
