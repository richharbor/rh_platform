require("dotenv").config();

const { getSchema } = require("./schema");

const CAN_DB_LOG = process.env.DB_LOGGER === "true";
const schema = getSchema();

const POOL = {
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  min: parseInt(process.env.DB_POOL_MIN || "0", 10),
  acquire: parseInt(process.env.DB_POOL_ACQUIRE_MS || "30000", 10),
  idle: parseInt(process.env.DB_POOL_IDLE_MS || "10000", 10),
};

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  pool: POOL,
  logging: CAN_DB_LOG ? console.log : false,
  // Every model created via sequelize.define()/Model.init() without an
  // explicit `schema` inherits this. Models also pass schema explicitly
  // (belt-and-suspenders) — see models/*.js.
  define: {
    schema,
  },
  // Keeps the SequelizeMeta migration-history table inside the same schema
  // instead of the default `public`, so migration state is isolated per
  // schema too (important if this DB is ever shared with another schema's
  // codebase).
  migrationStorageTableSchema: schema,
};

const sslDialectOptions = (requireSsl) => ({
  ssl:
    process.env.DB_SSL === "true"
      ? { require: requireSsl, rejectUnauthorized: false }
      : undefined,
});

module.exports = {
  development: {
    ...base,
    dialectOptions:
      process.env.DB_SSL === "true" ? sslDialectOptions(false) : {},
  },
  test: {
    ...base,
    dialectOptions:
      process.env.DB_SSL === "true" ? sslDialectOptions(true) : {},
  },
  production: {
    ...base,
    dialectOptions:
      process.env.DB_SSL === "true" ? sslDialectOptions(true) : {},
  },
};
