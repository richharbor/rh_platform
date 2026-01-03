const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Uses platform/models/index.js

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            console.log("[Auth Debug] No token provided. Header:", authHeader);
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`[Auth Debug] Token decoded for User ID: ${decoded.id}`);

        const user = await User.findOne({
            where: {
                id: decoded.id,
            },
        });

        if (!user) {
            console.log(`[Auth Debug] User not found for ID: ${decoded.id}`);
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error("[Platform Auth Error]:", error.message, error.stack);
        console.error("[Auth Debug] Token:", req.header("Authorization"));
        res.status(401).json({ error: "Please authenticate", details: error.message });
    }
};

const authenticateSoft = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            where: {
                id: decoded.id,
            },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error("[Platform Auth Soft Error]:", error.message);
        res.status(401).json({ error: "Authentication failed" });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Admin privileges required" });
    }
};

const requirePartner = (req, res, next) => {
    if (
        req.user &&
        (req.user.role === "partner" ||
            req.user.role === "admin" ||
            req.user.role === "referral_partner")
    ) {
        next();
    } else {
        res.status(403).json({ error: "Partner privileges required" });
    }
};

module.exports = {
    authenticate,
    authenticateSoft,
    requireAdmin,
    requirePartner,
};
