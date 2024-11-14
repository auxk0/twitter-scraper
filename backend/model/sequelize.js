const { Sequelize } = require('sequelize');

// Replace these with your own database details
const sequelize = new Sequelize('twitter_scraping', 'user', 'password', {
  host: 'localhost',      // Database host (could be an IP or domain name)
  port: 3306,
  dialect: 'mysql',       // MySQL (could be 'postgres', 'sqlite', etc.)
  logging: false,         // Set to true to see raw SQL queries in the console
});

module.exports = sequelize;