const { Lead } = require('../models');

module.exports = {
  // GET /api/leads
  async getAll(req, res) {
    try {
      const leads = await Lead.findAll();
      res.json(leads);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  },

  // POST /api/leads
  async create(req, res) {
    try {
      const { name, email, phone, shareName, quantity } = req.body;
      const lead = await Lead.create({ name, email, phone, shareName, quantity });
      res.status(201).json(lead);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Failed to create lead', details: err });
    }
  },
};
