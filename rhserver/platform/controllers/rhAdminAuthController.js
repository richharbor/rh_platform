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

module.exports = {
    login,
    getMe,
    seed
};
