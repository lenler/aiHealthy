'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: env === 'development' ? console.log : false,
  });
} else {
  const config = require(__dirname + '/../config/config.json')[env];
  sequelize = new Sequelize(
    config.database,
    process.env.DB_USERNAME || config.username,
    process.env.DB_PASSWORD || config.password,
    {
      host: process.env.DB_HOST || config.host,
      dialect: config.dialect,
      logging: env === 'development' ? console.log : false,
    }
  );
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-4) === '.cjs' || file.slice(-3) === '.js') &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
