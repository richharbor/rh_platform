const scenario = require("../../service/rfin/scenario");

// POST /rfin/dev/scenario { failPayments } — mounted only outside production.
const setScenario = (req, res) => {
  if (typeof req.body.failPayments === "boolean") scenario.set({ failPayments: req.body.failPayments });
  res.json(scenario.get());
};

module.exports = { setScenario };
