const { User } = require("../models");
const bcrypt = require("bcryptjs");

const bootstrapAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@rhinontech.com";
        const adminPass = process.env.ADMIN_PASSWORD || "1q2w3e";

        const existing = await User.findOne({ where: { email: adminEmail } });
        if (!existing) {
            const hashedPassword = await bcrypt.hash(adminPass, 10);
            await User.create({
                email: adminEmail,
                password_hash: hashedPassword,
                role: "admin",
                name: "Super Admin",
                onboarding_completed: true,
                email_verified_at: new Date()
            });
            console.log(`[Platform] Bootstrapped admin user: ${adminEmail}`);
        } else {
            // Optional: Ensure role is admin
            if (existing.role !== 'admin') {
                existing.role = 'admin';
                await existing.save();
                console.log(`[Platform] Updated existing user to admin: ${adminEmail}`);
            }
        }
    } catch (e) {
        console.error("[Platform] Bootstrap failed:", e.message);
    }
};

module.exports = bootstrapAdmin;
