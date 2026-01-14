require('dotenv').config();

const dbConfig = {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.PLATFORM_DB_NAME || 'rh_platform',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5455,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
};

module.exports = {
    development: dbConfig,
    test: dbConfig,
    production: dbConfig
};
