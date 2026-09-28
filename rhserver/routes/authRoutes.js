const express = require("express");
const router = express.Router();

const { login, refreshToken, getInviteInfo, acceptInvite, me } = require("../controllers/authController");
const authenticate = require("../middlewares/authenticate");

// Drops /signup and /login-with-google from tps-next-backend's
// companyAuthRoutes.js — this build is email/password + invite-to-join only.
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/invite/info", getInviteInfo);
router.post("/accept-invite", acceptInvite);
router.get("/me", authenticate, me);

module.exports = router;
