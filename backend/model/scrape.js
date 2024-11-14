const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Scrape = sequelize.define('Scrape', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    queryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSON,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    tableName: 'scrapes',  // The actual table name in the database
});

module.exports = Scrape;