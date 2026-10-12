const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Candidate = require("./Candidate");
const Exam = require("./Exam");

const ExamAttempt = sequelize.define("ExamAttempt", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  startedAt: { type: DataTypes.DATE, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false }
});

ExamAttempt.belongsTo(Candidate, { foreignKey: "candidateId" });
ExamAttempt.belongsTo(Exam, { foreignKey: "examId" });

module.exports = ExamAttempt;
