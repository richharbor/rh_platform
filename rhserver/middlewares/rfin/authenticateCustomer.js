const jwt = require("jsonwebtoken");
const db = require("../../models");

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// RFIN customer auth — separate from admin auth. Tokens carry
// { customer_id, type: "rfin_customer" }; an admin token is rejected here and a
// customer token is rejected by middlewares/authenticate.js (no admin_id).
module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "Sign in to continue" });
  let decoded;
  try {
    decoded = jwt.verify(header.split(" ")[1], SECRET_KEY);
  } catch {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
  if (!decoded || decoded.type !== "rfin_customer" || !decoded.customer_id) {
    return res.status(401).json({ error: "Sign in to continue" });
  }
  const customer = await db.rfinCustomer.findByPk(decoded.customer_id);
  if (!customer) return res.status(401).json({ error: "Account not found" });
  req.customer = customer;
  next();
};
