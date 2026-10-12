const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Candidate = require("./Candidate");
const Exam = require("./Exam");
const Question = require("./Question");

const Answer = sequelize.define("Answer", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  selectedOption: { type: DataTypes.INTEGER, allowNull: false }
});

Answer.belongsTo(Candidate, { foreignKey: "candidateId" });
Answer.belongsTo(Exam, { foreignKey: "examId" });
Answer.belongsTo(Question, { foreignKey: "questionId" });

Answer.addIndex = () => {};
sequelize.query || null;

module.exports = Answer;
