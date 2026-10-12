const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Candidate = sequelize.define("Candidate", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(80), allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Candidate;
