const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User, Otp } = require("../models"); // Uses platform/models/index.js
const awsService = require("../services/awsService");
const { sendEmail } = require("../services/emailService");

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be defined");
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// --- OTP & LOGIN LOGIC ---

// Send OTP (Email or Phone)
const requestOtp = async (req, res) => {
    try {
        const { email, phone, purpose } = req.body; // purpose: 'signup' or 'login'
        const identifier = email ? email.toLowerCase() : phone;
        const type = email ? "email" : "phone";

        if (!identifier) {
            return res.status(400).json({ error: "Email or Phone required" });
        }

        if (!purpose || !["signup", "login"].includes(purpose)) {
            return res.status(400).json({ error: "Invalid purpose. Must be 'signup' or 'login'" });
        }

        // Check if user exists
        const user = await User.findOne({
            where: email ? { email: identifier } : { phone: identifier },
        });

        if (purpose === "signup" && user) {
            // Block signup if account exists
            return res.status(400).json({ error: "Account already exists. Please login." });
        }

        if (purpose === "login" && !user) {
            return res.status(404).json({ error: "Account not found. Please sign up." });
        }

        // Generate OTP
        const code = crypto.randomInt(100000, 999999).toString();
        // In prod hash this code
        const code_hash = code;

        // Send OTP
        if (type === "email") {
            console.log(`Email OTP to ${identifier}: ${code}`);

            await Otp.create({
                email: identifier,
                phone: null,
                code_hash,
                purpose,
                expires_at: new Date(Date.now() + 10 * 60000),
            });

            const subject = `${code} is your Rich Harbor verification code`;
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verification Code</h2>
                    <p>Use the following code to login or sign up to Rich Harbor Platform:</p>
                    <h1 style="color: #5b46ff; letter-spacing: 5px;">${code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `;

            await sendEmail(identifier, subject, htmlContent);
        } else {
            console.log(`SMS OTP to ${identifier}: ${code}`);
            // Pass the controller-generated code to the service
            const snsResult = await awsService.sendSnsOtp(identifier, code);

            await Otp.create({
                phone: identifier,
                email: null,
                code_hash,
                purpose,
                expires_at: new Date(Date.now() + 5 * 60000),
            });
        }

        res.json({ message: "OTP sent successfully", type });
    } catch (error) {
        console.error("Request OTP error:", error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

// Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, phone, otp, purpose } = req.body;
        const identifier = email ? email.toLowerCase() : phone;
        const type = email ? "email" : "phone";

        if (!identifier || !otp || !purpose) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find OTP record
        const query = { purpose };

        if (type === "email") {
            query.email = identifier;
        } else {
            query.phone = identifier;
        }

        const record = await Otp.findOne({
            where: query,
            order: [["createdAt", "DESC"]],
        });

        if (!record || record.code_hash !== otp || new Date() > record.expires_at) {
            return res.status(400).json({ error: "Invalid or expired code" });
        }

        // OTP Valid
        if (purpose === "login") {
            const user = await User.findOne({
                where: email ? { email: identifier } : { phone: identifier },
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const token = generateToken(user);
            console.log(`User logged in: ${user.email || user.phone}`);
            res.json({
                access_token: token,
                token_type: "bearer",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    phone: user.phone,
                    onboarding_completed: user.onboarding_completed,
                },
            });
        } else {
            // Signup: Create/Update user and return token
            let user = await User.findOne({
                where: email ? { email: identifier } : { phone: identifier },
            });

            if (!user) {
                user = await User.create({
                    email: email ? identifier : null,
                    phone: phone ? identifier : null,
                    password_hash: "otp_verified", // Placeholder
                    phone_verified_at: phone ? new Date() : null,
                    email_verified_at: email ? new Date() : null,
                    role: (req.body.role || "customer").toLowerCase().replace(" ", "_"), // simple sanitization
                    signup_step: 0,
                });
                console.log(`New user created: ${user.email || user.phone}`);
            } else {
                if (phone) user.phone_verified_at = new Date();
                if (email) user.email_verified_at = new Date();
                await user.save();
                console.log(`User verified: ${user.email || user.phone}`);
            }

            const token = generateToken(user);
            res.json({
                access_token: token,
                token_type: "bearer",
                message: "OTP Verified. Proceed to onboarding.",
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    signup_step: user.signup_step,
                    onboarding_completed: user.onboarding_completed,
                },
            });
        }
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
};


// --- ONBOARDING LOGIC ---

const getOnboardingStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({
            step: user.signup_step || 0,
            data: user.signup_data || {},
            role: user.role,
            is_completed: user.onboarding_completed
        });
    } catch (error) {
        console.error("Get onboarding status error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Update onboarding step
const updateOnboardingStep = async (req, res) => {
    try {
        const { step, data, role, is_final } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (role) {
            const allowedRoles = ["customer", "partner", "franchise"]; // Whitelist
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({ error: "Invalid or restricted role" });
            }
            user.role = role;
        }
        if (step !== undefined) user.signup_step = step;

        // Merge data
        if (data) {
            user.signup_data = { ...user.signup_data, ...data };

            // Map specific fields to user model columns if they exist
            if (data.fullName) user.name = data.fullName;
            if (data.city) user.city = data.city;
            if (data.company) user.company_name = data.company;
        }

        if (is_final) {
            user.onboarding_completed = true;
            user.is_active = true; // Auto-activate or pending logic
            console.log(`User completed onboarding: ${user.email || user.phone}`);
        }

        await user.save();

        res.json({ success: true, step: user.signup_step });
    } catch (error) {
        console.error("Update onboarding step error:", error);
        res.status(500).json({ error: "Failed to update onboarding step" });
    }
};

const register = async (req, res) => {
    res.status(400).json({ error: "Use /request-otp for signup" });
};

const login = async (req, res) => {
    // Legacy password login support
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email: email.toLowerCase() } });

        if (!user || user.password_hash === 'otp_verified' || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);
        res.json({
            access_token: token,
            token_type: "bearer",
            user: { id: user.id, role: user.role }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        if (!user || user.role !== 'admin' || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }
        const token = generateToken(user);
        res.json({ access_token: token, user: { id: user.id, role: user.role } });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ error: error.message });
    }
};

const refresh = async (req, res) => {
    // ... simplified
    res.json({ message: "Refresh not implemented in stub" });
};

const me = async (req, res) => {
    const user = req.user;
    res.json({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        onboarding_completed: user.onboarding_completed,
        signup_step: user.signup_step
    });
};

module.exports = {
    requestOtp,
    verifyOtp,
    getOnboardingStatus,
    updateOnboardingStep,
    register,
    login,
    adminLogin,
    refresh,
    me,
    // Aliases for compatibility with route names if needed
    requestSignupOtp: requestOtp,
    verifySignupOtp: verifyOtp,
    resendSignupOtp: requestOtp,
    completeSignup: updateOnboardingStep
};
