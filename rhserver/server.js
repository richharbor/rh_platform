require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./models");

require("./jobs");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const blogRoutes = require("./routes/blogRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const leadRoutes = require("./routes/leadRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const contactRoutes = require("./routes/contactRoutes");
const unsubscribeRoutes = require("./routes/unsubscribeRoutes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  res.send("Rich Harbor admin backend");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/blogs", blogRoutes);
app.use("/upload", uploadRoutes);
app.use("/leads", leadRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/contacts", contactRoutes);
app.use("/unsubscribe", unsubscribeRoutes);

app.use(notFound);
app.use(errorHandler);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("PostgreSQL Connected Successfully");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("DB Connection Error:", err));

module.exports = app;
