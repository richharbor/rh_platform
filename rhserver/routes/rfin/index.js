const express = require("express");
const router = express.Router();

const authenticateCustomer = require("../../middlewares/rfin/authenticateCustomer");
const permit = require("../../middlewares/rfin/requireCustomerPermission");
const auth = require("../../controllers/rfin/authController");
const customer = require("../../controllers/rfin/customerController");
const catalogue = require("../../controllers/rfin/catalogueController");
const verification = require("../../controllers/rfin/verificationController");
const orders = require("../../controllers/rfin/orderController");
const rewards = require("../../controllers/rfin/rewardsController");
const partner = require("../../controllers/rfin/partnerController");
const dev = require("../../controllers/rfin/devController");

// Mounted at /rfin by server.js — the RFIN customer API used by the Expo app
// and the desktop app. Endpoint ↔ client op mapping: shared/rfin/src/http.ts.
// Permissions: shared/rfin/src/rbac.json.

// Public
router.post("/auth/otp", auth.sendOtp);
router.post("/auth/verify", auth.verifyOtp);
router.get("/products", catalogue.listProducts);
router.get("/products/:id", catalogue.getProduct);

if (process.env.NODE_ENV !== "production") router.post("/dev/scenario", dev.setScenario);

// Signed-in customers
router.use(authenticateCustomer);

router.get("/me", permit("profile", "view"), customer.getMe);
router.patch("/me", permit("profile", "view"), customer.updateMe);

router.get("/companies", permit("private_markets", "view"), catalogue.listCompanies);
router.get("/companies/:id", permit("private_markets", "view"), catalogue.getCompany);
router.post("/eligibility", permit("products", "check_eligibility"), catalogue.eligibility);

router.get("/kyc", permit("kyc", "view"), verification.listKyc);
router.post("/kyc/:itemId/upload", permit("kyc", "upload"), verification.uploadKyc);
router.get("/banks", permit("bank", "view"), verification.listBanks);
router.post("/banks", permit("bank", "add"), verification.addBank);
router.post("/consents", permit("applications", "create"), verification.recordConsent);

router.get("/orders", permit("orders", "view"), orders.listOrders);
router.get("/orders/:id", permit("orders", "view"), orders.getOrder);
router.post("/orders", permit("applications", "create"), orders.createOrder);
router.post("/orders/:id/retry-payment", permit("orders", "retry_payment"), orders.retryPayment);

router.get("/points", permit("rewards", "view"), rewards.listPoints);
router.get("/draws", permit("rewards", "view"), rewards.listDraws);

router.get("/leads", permit("leads", "view"), partner.listLeads);
router.get("/commissions", permit("earnings", "view"), partner.listCommissions);

module.exports = router;
