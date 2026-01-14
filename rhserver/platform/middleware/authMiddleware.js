const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
        if (err) return res.sendStatus(403);

        if (user.type !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        req.user = user;
        next();
    });
};

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", async (err, decoded) => {
        if (err) return res.sendStatus(403);

        try {
            const { User } = require('../models');
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(401).json({ error: "User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.sendStatus(500);
        }
    });
};

module.exports = { authenticate, authenticateAdmin };
