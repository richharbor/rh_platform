// Ported unchanged from tps-next-backend's
// service/campaign/emailUnsubscribeToken.js. Signs/verifies a JWT
// identifying an email/campaign for the public unsubscribe link, using
// process.env.UNSUBSCRIBE_SECRET.
const jwt = require("jsonwebtoken");

function generateUnsubscribeToken(email, campaignId) {
  return jwt.sign(
    { email, campaignId },
    process.env.UNSUBSCRIBE_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyUnsubscribeToken(token) {
  try {
    return jwt.verify(token, process.env.UNSUBSCRIBE_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
};
