const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Exam = require("./Exam");

const Question = sequelize.define("Question", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  questionText: { type: DataTypes.TEXT, allowNull: false },
  options: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() { return JSON.parse(this.getDataValue("options")); },
    set(val) { this.setDataValue("options", JSON.stringify(val)); }
  },
  correctAnswer: { type: DataTypes.INTEGER, allowNull: false },
  marks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
});

Exam.hasMany(Question, { foreignKey: "examId", onDelete: "CASCADE" });
Question.belongsTo(Exam, { foreignKey: "examId" });

module.exports = Question;
