require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models"); // Main DB
const platformDB = require("./platform/models"); // Platform DB isolated

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const fileUploadRoutes = require("./routes/fileUploadRoutes");
const liquidateShareRoutes = require("./routes/liquidateShareRoutes");
const emailRoutes = require("./routes/emailRoutes");
const leadRoutes = require("./routes/leadRoutes");
const teamsRoutes = require("./routes/teamsRoutes");
const franchisesRoutes = require("./routes/franchisesRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const sellRoutes = require("./routes/sellRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const bidsRoutes = require("./routes/bidsRoutes");
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");

const webpush = require("web-push");

const app = express();

// Middleware
// Allow all origins
const corsOptions = {
  origin: true, // true means reflect request origin, allows all
  credentials: true, // allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const { globalLimiter } = require("./platform/middleware/rateLimiter");
app.use(globalLimiter);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Hello World! Backend is running." });
});

// webpush.setVapidDetails(
//   "mailto:frontend@rhinontech.com",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );



// Health check
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      message: "Database connected successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});


// const subscriptions = [];

// app.post("/api/notification/save-subscription", (req, res) => {
//   subscriptions.push(req.body);
//   if (subscriptions.length > 0) {
//     webpush.sendNotification(subscriptions[0], JSON.stringify({
//       title: "Hello!",
//       body: "This is a test message"
//     }));
//   }
//   res.json({ success: true });
// });



// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", fileUploadRoutes);
app.use("/api/liquidate-shares", liquidateShareRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/franchises", franchisesRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/sell", sellRoutes);
app.use("/api/booking", bookingRoutes)
app.use("/api/bids", bidsRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/notification", notificationRoutes)
app.use("/api/whatsapp", whatsappRoutes)

// --- Platform Services (Isolated) ---
const platformAuthRoutes = require("./platform/routes/authRoutes");
const platformLeadRoutes = require("./platform/routes/leadRoutes");
const platformAdminRoutes = require('./platform/routes/adminRoutes'); // Renamed to avoid conflict with global adminRoutes

// Routes
app.use('/v1/admin', platformAdminRoutes); // Using platformAdminRoutes for /api/admin
const platformRewardRoutes = require("./platform/routes/rewardRoutes");
app.use("/v1/rewards", platformRewardRoutes);

const platformSupportRoutes = require("./platform/routes/supportRoutes");
app.use("/v1/support", platformSupportRoutes);

const platformContestRoutes = require("./platform/routes/contestRoutes");
app.use("/v1/contests", platformContestRoutes);

const platformNotificationRoutes = require("./platform/routes/notificationRoutes");
app.use("/v1/notifications", platformNotificationRoutes);

app.use("/v1", (req, res, next) => {
  console.log(`[V1 Debug] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/v1", platformAuthRoutes);
app.use("/v1", platformLeadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT;

// Start server
const startServer = async () => {
  try {
    // --- Ensure Databases Exist ---
    if (process.env.NODE_ENV === "development") {
      const { Client } = require('pg');
      const createDb = async (dbName) => {
        const client = new Client({
          user: process.env.DB_USERNAME || 'postgres',
          host: process.env.DB_HOST || 'db',
          database: 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          port: 5432,
        });
        await client.connect();
        try {
          const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
          if (res.rowCount === 0) {
            console.log(`  Creating database: ${dbName}`);
            await client.query(`CREATE DATABASE "${dbName}"`);
          }
        } finally {
          await client.end();
        }
      };
      try {
        await createDb('richharbor-beta');
        await createDb('rh_platform');
      } catch (dbErr) {
        console.warn("  Note: Database creation check failed (might already exist):", dbErr.message);
      }
    }

    await sequelize.authenticate();
    console.log("  Database connection established successfully.");

    // Sync models with database
    await sequelize.sync({ alter: false });
    console.log("  Database (Main) models synchronized.");

    // Sync Platform DB
    try {
      await platformDB.sequelize.authenticate();
      console.log("  Database (Platform) connection established.");
      await platformDB.sequelize.sync({ alter: false }); // migration-driven
      console.log("  Database (Platform) models synchronized.");

      const bootstrapAdmin = require("./platform/utils/bootstrap");
      await bootstrapAdmin();
    } catch (err) {
      console.error("  Warning: Platform DB connection failed:", err.message);
      // We don't exit process, maybe platform is optional or config missing
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
