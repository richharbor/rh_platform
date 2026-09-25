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
const activity = require("../../controllers/rfin/activityController");
const support = require("../../controllers/rfin/supportController");
const markets = require("../../controllers/rfin/marketsController");
const c360 = require("../../controllers/rfin/customer360Controller");

// Mounted at /rfin by server.js — the RFIN customer API used by the Expo app
// and the desktop app. Endpoint ↔ client op mapping: shared/rfin/src/http.ts.
// Permissions: shared/rfin/src/rbac.json.

// Public
router.post("/auth/otp", auth.sendOtp);
router.post("/auth/verify", auth.verifyOtp);
router.get("/products", catalogue.listProducts);
router.get("/products/:id", catalogue.getProduct);
router.get("/support/faqs", support.listFaqs);
router.get("/support/suggest", c360.suggest);
router.get("/insights/content", c360.research);

if (process.env.NODE_ENV !== "production") router.post("/dev/scenario", dev.setScenario);

// Signed-in customers
router.use(authenticateCustomer);

router.get("/me", permit("profile", "view"), customer.getMe);
router.patch("/me", permit("profile", "view"), customer.updateMe);

router.get("/companies", permit("private_markets", "view"), catalogue.listCompanies);
router.get("/companies/:id", permit("private_markets", "view"), catalogue.getCompany);
router.get("/companies/:id/quote", permit("private_markets", "view"), markets.quote);
router.get("/companies/:id/price-discovery", permit("private_markets", "view"), markets.priceDiscovery);
router.get("/watchlist", permit("private_markets", "view"), markets.listWatchlist);
router.put("/watchlist/:companyId", permit("private_markets", "view"), markets.watch);
router.delete("/watchlist/:companyId", permit("private_markets", "view"), markets.unwatch);
router.get("/portfolio", permit("private_markets", "view"), markets.portfolio);
router.get("/sell-listings", permit("private_markets", "view"), markets.listListings);
router.get("/sell-listings/:id", permit("private_markets", "view"), markets.getListing);
router.post("/sell-listings", permit("private_markets", "sell"), markets.createListing);
router.post("/sell-listings/:id/cancel", permit("private_markets", "sell"), markets.cancelListing);
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
router.post("/orders/:id/action", permit("orders", "view"), orders.act);

router.get("/documents", permit("documents", "view"), activity.listDocuments);
router.get("/notifications", permit("notifications", "view"), activity.listNotifications);
router.post("/notifications/read", permit("notifications", "view"), activity.markRead);
router.get("/notification-preferences", permit("notifications", "manage"), activity.getPrefs);
router.patch("/notification-preferences", permit("notifications", "manage"), activity.updatePrefs);

router.get("/support/tickets", permit("support", "view"), support.listTickets);
router.get("/support/tickets/:id", permit("support", "view"), support.getTicket);
router.post("/support/tickets", permit("support", "create"), support.createTicket);
router.post("/support/tickets/:id/messages", permit("support", "create"), support.reply);
router.post("/support/tickets/:id/resolve", permit("support", "create"), support.resolve);

router.get("/rewards/summary", permit("rewards", "view"), rewards.summary);
router.get("/points", permit("rewards", "view"), rewards.listPoints);
router.get("/draws", permit("rewards", "view"), rewards.listDraws);
router.get("/draws/:id", permit("rewards", "view"), rewards.getDraw);
router.get("/benefits", permit("rewards", "view"), rewards.listBenefits);
router.get("/benefits/:id", permit("rewards", "view"), rewards.getBenefit);
router.post("/benefits/:id/redeem", permit("rewards", "view"), rewards.redeem);
router.get("/referrals", permit("referrals", "view"), rewards.listReferrals);
router.post("/referrals", permit("referrals", "create"), rewards.createReferral);

router.get("/partner/profile", permit("partner_onboarding", "view"), partner.getProfile);
router.patch("/partner/profile", permit("partner_onboarding", "submit"), partner.updateProfile);
router.post("/partner/profile/submit", permit("partner_onboarding", "submit"), partner.submitProfile);
router.get("/partner/resources", permit("resources", "view"), partner.resources);
router.get("/leads", permit("leads", "view"), partner.listLeads);
router.post("/leads", permit("leads", "create"), partner.createLead);
router.get("/leads/:id", permit("leads", "view"), partner.getLead);
router.patch("/leads/:id", permit("leads", "update"), partner.updateLead);
router.get("/cases", permit("cases", "view"), partner.listCases);
router.get("/cases/:id", permit("cases", "view"), partner.getCase);
router.get("/clients", permit("clients", "view"), partner.listClients);
router.get("/clients/:key", permit("clients", "view"), partner.getClient);
router.get("/opportunities", permit("opportunities", "view"), partner.listOpportunities);
router.get("/commissions", permit("earnings", "view"), partner.listCommissions);
router.get("/payouts", permit("payouts", "view"), partner.listPayouts);
router.post("/payouts", permit("payouts", "request"), partner.requestPayout);

// Step 8 — Customer 360, goals, family, insights, alerts, assistant (Phase 2 + 3)
router.get("/financial-profile", permit("customer360", "view"), c360.getFinancial);
router.patch("/financial-profile", permit("customer360", "edit"), c360.updateFinancial);
router.get("/external-products", permit("customer360", "view"), c360.listExternal);
router.post("/external-products", permit("customer360", "edit"), c360.addExternal);
router.delete("/external-products/:id", permit("customer360", "edit"), c360.removeExternal);
router.get("/family", permit("family", "view"), c360.listFamily);
router.post("/family", permit("family", "manage"), c360.addFamily);
router.patch("/family/:id", permit("family", "manage"), c360.updateFamily);
router.delete("/family/:id", permit("family", "manage"), c360.removeFamily);
router.get("/goals", permit("goals", "view"), c360.listGoals);
router.post("/goals", permit("goals", "manage"), c360.createGoal);
router.get("/goals/:id", permit("goals", "view"), c360.getGoal);
router.post("/goals/:id/contributions", permit("goals", "manage"), c360.contribute);
router.post("/goals/:id/archive", permit("goals", "manage"), c360.archiveGoal);
router.get("/financial-life", permit("insights", "view"), c360.life);
router.get("/recommendations", permit("insights", "view"), c360.recommendations);
router.get("/alerts", permit("alerts", "view"), c360.listAlerts);
router.post("/alerts", permit("alerts", "manage"), c360.createAlert);
router.delete("/alerts/:id", permit("alerts", "manage"), c360.removeAlert);
router.post("/assistant", permit("assistant", "use"), c360.ask);
router.get("/partner/insights", permit("partner_insights", "view"), c360.partnerInsights);

module.exports = router;
