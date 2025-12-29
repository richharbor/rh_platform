const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, authenticateSoft } = require("../middleware/auth");
const { validateOnboarding } = require("../middleware/validation");
const {
  Roles,
  UserRoles,
  Users,
  OnboardingApplications,
  Franchises,
} = require("../models");

router.get("/roles", async (req, res) => {
  try {
    const roles = await Roles.findAll({
      where: { isActive: true },
      attributes: ["id", "name", "description"],
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

router.get("/me", authenticateSoft, async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: UserRoles,
          as: "userRoles",
          // where: { isActive: true },
          required: false,
          include: [
            {
              model: Roles,
              as: "role",
              attributes: ["id", "name", "description", "permissions"],
            },
          ],
        },
        {
          model: Franchises,
          as: "franchise",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }



    // Build roles from userRoles
    const roles = user.userRoles.map((ur) => ({
      id: ur.role?.id,
      name: ur.role?.name,
      description: ur.role?.description,
      permissions: ur.role?.permissions || [],
      isPrimary: ur.isPrimary,
    }));

    // Determine current role
    let currentRole = null;
    if (req.user.currentRoleId) {
      currentRole =
        roles.find((r) => r.id === req.user.currentRoleId) ||
        roles.find((r) => r.isPrimary) ||
        roles[0] ||
        null;
    } else {
      currentRole = roles.find((r) => r.isPrimary) || roles[0] || null;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        franchiseId: user.franchiseId,
        franchiseName: user.franchise ? user.franchise.name : null, // ✅ added here
        tier: user.tier,
        roles,
        currentRole,
      },
      onboarding: {
        required: false,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("Auth/me error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.post("/create-superadmin", authController.createSuperAdmin);

router.post("/login", authController.login);

router.post("/verify-email", authController.verifyAndUpdatePassword);
router.post("/verify-parnter-email", authController.verifyPartnerEmail)

// Onboarding steps
router.post("/onboard/start", authController.startOnboarding);
router.post("/onboard/step2", authenticateSoft, authController.saveAccountInfo);
router.post("/onboard/step3", authenticateSoft, authController.uploadDocuments);
router.post("/onboard/step4", authenticateSoft, authController.submitAgreement);

router.post(
  "/onboard/step5",
  authenticateSoft,
  authController.saveBusinessInfo
);

router.post(
  "/onboard/complete",
  authenticateSoft,
  authController.completeOnboarding
);

router.get(
  "/onboard/status",
  authenticateSoft,
  authController.getApplicationStatus
);

router.post("/verify-onboarding", authController.verifyOnboardingToken);
router.post("/switch-role", authenticate, authController.switchRole);

//forgot password
router.post(
  "/request-password-reset",
  authController.sendPasswordResetEmail
);
router.post(
  "/verify-reset-token",
  authController.verifyPasswordResetToken
);
router.post("/reset-password", authController.verifyAndForgetPassword);

module.exports = router;
