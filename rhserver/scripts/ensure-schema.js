// Bootstraps the Postgres schema before the first `sequelize-cli db:migrate`
// runs. Postgres will not auto-create an unknown schema, and Sequelize's
// migration runner needs SequelizeMeta's target schema to already exist.
// Run via `npm run db:prepare`.
require("dotenv").config();
const { Client } = require("pg");
const { getSchema } = require("../config/schema");

async function ensureSchema() {
  const schema = getSchema();

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  await client.connect();
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    console.log(`Schema "${schema}" is ready.`);
  } finally {
    await client.end();
  }
}

ensureSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to ensure schema:", err);
    process.exit(1);
  });
