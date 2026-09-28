// sequelize-cli config for the RFIN migrations/seeders (migrations/rfin,
// seeders/rfin). Same connection as config.js; migration history is kept in a
// separate table so admin and rfin histories never interleave. It sits in the
// admin schema because it must exist before the rfin schema is created.
const base = require("./config");

const withRfin = (c) => ({ ...c, migrationStorageTableName: "SequelizeMetaRfin" });

module.exports = {
  development: withRfin(base.development),
  test: withRfin(base.test),
  production: withRfin(base.production),
};
