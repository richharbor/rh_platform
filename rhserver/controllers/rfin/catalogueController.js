const { Op } = require("sequelize");
const db = require("../../models");
const asyncWrapper = require("../../utils/asyncWrapper");
const serialize = require("../../service/rfin/serialize");
const { checkEligibility } = require("../../service/rfin/eligibility");

const like = (q) => ({ [Op.iLike]: `%${String(q).replace(/[%_]/g, "\\$&")}%` });

// GET /rfin/products?category&q
const listProducts = asyncWrapper(async (req, res) => {
  const { category, q } = req.query;
  const where = {};
  if (category) where.category = category;
  if (q) where[Op.or] = [{ name: like(q) }, { provider: like(q) }];
  const rows = await db.rfinProduct.findAll({ where, order: [["sort", "ASC"]] });
  res.json(rows.map(serialize.product));
});

// GET /rfin/products/:id
const getProduct = asyncWrapper(async (req, res) => {
  const p = await db.rfinProduct.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: "Product not found" });
  res.json(serialize.product(p));
});

// GET /rfin/companies?q&theme
const listCompanies = asyncWrapper(async (req, res) => {
  const { q, theme } = req.query;
  const where = {};
  if (q) where[Op.or] = [{ name: like(q) }, { sector: like(q) }];
  if (theme) where.themes = { [Op.contains]: [theme] };
  const rows = await db.rfinCompany.findAll({ where, order: [["name", "ASC"]] });
  res.json(rows.map(serialize.company));
});

// GET /rfin/companies/:id
const getCompany = asyncWrapper(async (req, res) => {
  const c = await db.rfinCompany.findByPk(req.params.id);
  if (!c) return res.status(404).json({ error: "Company not found" });
  res.json(serialize.company(c));
});

// POST /rfin/eligibility { productId, monthlyIncome, amount? }
const eligibility = asyncWrapper(async (req, res) => {
  const { productId, monthlyIncome, amount } = req.body;
  const p = productId && (await db.rfinProduct.findByPk(productId));
  if (!p) return res.status(404).json({ error: "Product not found" });
  if (!(Number(monthlyIncome) > 0)) return res.status(400).json({ error: "Enter your monthly income" });
  res.json(checkEligibility(p, monthlyIncome, amount ? Number(amount) : undefined));
});

module.exports = { listProducts, getProduct, listCompanies, getCompany, eligibility };
