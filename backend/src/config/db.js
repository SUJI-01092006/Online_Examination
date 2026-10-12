const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "..", "database.sqlite"),
  logging: false
});

async function connectDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("SQLite connected and tables synced.");
}

module.exports = { sequelize, connectDatabase };
