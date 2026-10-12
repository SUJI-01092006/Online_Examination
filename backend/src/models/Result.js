const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Candidate = require("./Candidate");
const Exam = require("./Exam");

const Result = sequelize.define("Result", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  marksObtained: { type: DataTypes.INTEGER, allowNull: false },
  totalMarks: { type: DataTypes.INTEGER, allowNull: false },
  percentage: { type: DataTypes.FLOAT, allowNull: false },
  passed: { type: DataTypes.BOOLEAN, allowNull: false },
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

Result.belongsTo(Candidate, { foreignKey: "candidateId" });
Result.belongsTo(Exam, { foreignKey: "examId" });

module.exports = Result;
