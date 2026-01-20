const express = require("express");
const router = express.Router();
const authController = require("../controllers/rhAuthController");
const { authenticate } = require("../middleware/rhAuth");
const { authLimiter } = require("../../middleware/rateLimiter");

// --- Public Auth Routes ---

// OTP-based authentication
router.post("/auth/request-otp", authLimiter, authController.requestOtp);
router.post("/auth/verify-otp", authLimiter, authController.verifyOtp);

// Legacy password-based authentication
router.post("/auth/register", authLimiter, authController.register);
router.post("/auth/login", authLimiter, authController.login);
router.post("/admin/login", authLimiter, authController.adminLogin);

// Token refresh
router.post("/auth/refresh", authController.refresh);

// --- Protected Auth Routes ---

// Current user info
router.get("/auth/me", authenticate, authController.me);

// Onboarding management
router.get("/auth/onboarding/status", authenticate, authController.getOnboardingStatus);
router.post("/auth/onboarding/step", authenticate, authController.updateOnboardingStep);

// --- Legacy Signup Routes (for backward compatibility) ---

router.post("/auth/signup/request-otp", authLimiter, authController.requestSignupOtp);
router.post("/auth/signup/verify-otp", authLimiter, authController.verifySignupOtp);
router.post("/auth/signup/complete", authController.completeSignup);

module.exports = router;

