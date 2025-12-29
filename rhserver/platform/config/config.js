require('dotenv').config();

const dbConfig = {
    username: process.env.PLATFORM_DB_USERNAME || 'postgres',
    password: process.env.PLATFORM_DB_PASSWORD || 'postgres',
    database: process.env.PLATFORM_DB_NAME || 'rh_platform',
    host: process.env.PLATFORM_DB_HOST || 'localhost',
    port: process.env.PLATFORM_DB_PORT || 5455,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
};

module.exports = {
    development: dbConfig,
    test: dbConfig,
    production: dbConfig
};
