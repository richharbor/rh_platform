const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Admin, AdminRole } = require("../models");

// Admin Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find Admin
        const admin = await Admin.findOne({
            where: { email },
            include: [{ model: AdminRole, as: 'role' }]
        });

        if (!admin) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!admin.is_active) {
            return res.status(403).json({ error: "Account is disabled" });
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        console.log(`[AUTH DEBUG] Login attempt for: ${email}`);
        console.log(`[AUTH DEBUG] Admin found: ${!!admin}`);
        console.log(`[AUTH DEBUG] Password Match: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin.id, role: admin.role.name, type: 'admin' },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "12h" }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role.name,
                permissions: admin.role.permissions
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

// Get Current Admin
const getMe = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.user.id, {
            attributes: { exclude: ["password_hash"] },
            include: [{ model: AdminRole, as: 'role' }]
        });

        if (!admin) return res.status(404).json({ error: "Admin not found" });

        res.json(admin);
    } catch (error) {
        console.error("Get admin error:", error);
        res.status(500).json({ error: "Failed to fetch admin details" });
    }
};

// Seed Initial Admin & Roles
const seed = async (req, res) => {
    try {
        // Create Roles
        const roles = [
            { name: 'Super Admin', permissions: { all: true }, description: 'Full Access' },
            { name: 'Ops', permissions: { leads: true, partners: true }, description: 'Operations Manager' },
            { name: 'Finance', permissions: { payouts: true, wallet: true }, description: 'Finance Manager' },
            { name: 'RM', permissions: { leads: 'assigned_only' }, description: 'Relationship Manager' }
        ];

        for (const role of roles) {
            await AdminRole.findOrCreate({
                where: { name: role.name },
                defaults: role
            });
        }

        // Create Super Admin
        const superAdminRole = await AdminRole.findOne({ where: { name: 'Super Admin' } });
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const [admin, created] = await Admin.findOrCreate({
            where: { email: 'admin@rfin.in' },
            defaults: {
                name: 'Super Admin',
                password_hash: hashedPassword,
                role_id: superAdminRole.id
            }
        });

        res.json({ message: "Seeding complete", created });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ error: "Seeding failed", details: error.message });
    }
};

// Verify Invite Token
const verifyInviteToken = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                valid: false,
                error: "Token is required"
            });
        }

        const { Op } = require("sequelize");
        const admin = await Admin.findOne({
            where: {
                invite_token: token,
                is_active: false,
                invite_expires: { [Op.gt]: new Date() }
            },
            include: [{ model: AdminRole, as: 'role' }]
        });

        if (!admin) {
            return res.status(400).json({
                valid: false,
                error: "Invalid or expired invitation token"
            });
        }

        res.json({
            valid: true,
            admin: {
                email: admin.email,
                name: admin.name,
                role: admin.role.name
            }
        });
    } catch (error) {
        console.error("Verify invite token error:", error);
        res.status(500).json({
            valid: false,
            error: "Failed to verify token"
        });
    }
};

// Complete Invite Signup
const completeInvite = async (req, res) => {
    try {
        const { token, password, name } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: "Token and password are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        const { Op } = require("sequelize");
        const admin = await Admin.findOne({
            where: {
                invite_token: token,
                is_active: false,
                invite_expires: { [Op.gt]: new Date() }
            }
        });

        if (!admin) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update admin
        admin.password_hash = hashedPassword;
        admin.is_active = true;
        admin.invite_token = null;
        admin.invite_expires = null;
        if (name) admin.name = name;

        await admin.save();

        console.log(`[INVITE] Admin account activated: ${admin.email}`);

        res.json({ message: "Account activated successfully" });
    } catch (error) {
        console.error("Complete invite error:", error);
        res.status(500).json({ error: "Failed to complete invitation" });
    }
};

module.exports = {
    login,
    getMe,
    seed,
    verifyInviteToken,
    completeInvite
};
