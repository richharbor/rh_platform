const { Sequelize } = require('sequelize');
// Adjust path to config
const config = require('./config/config.js').development;

console.log('Testing connection with config:', {
    ...config,
    password: config.password ? '******' : undefined
});

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.close();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();
