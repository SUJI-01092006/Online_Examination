const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Exam = sequelize.define("Exam", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false },
  totalMarks: { type: DataTypes.INTEGER, allowNull: false },
  passMarks: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("draft", "published", "closed"), defaultValue: "draft" }
});

module.exports = Exam;
