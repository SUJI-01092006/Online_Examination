const { Op } = require("sequelize");
const Answer = require("../models/Answer");
const Exam = require("../models/Exam");
const ExamAttempt = require("../models/ExamAttempt");
const Question = require("../models/Question");
const Result = require("../models/Result");
const asyncHandler = require("../utils/asyncHandler");

async function getPublishedExam(examId) {
  if (!examId || isNaN(Number(examId))) return null;
  return Exam.findOne({ where: { id: examId, status: "published" } });
}

const listExams = asyncHandler(async (req, res) => {
  const exams = await Exam.findAll({ where: { status: "published" }, order: [["createdAt", "DESC"]] });
  const completed = await Result.findAll({ where: { candidateId: req.candidate.id }, attributes: ["examId"] });
  const completedIds = new Set(completed.map((r) => r.examId));
  return res.json({ exams: exams.map((exam) => ({ ...exam.toJSON(), completed: completedIds.has(exam.id) })) });
});

const getExam = asyncHandler(async (req, res) => {
  const exam = await getPublishedExam(req.params.examId);
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  const completed = await Result.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } });
  const questionCount = await Question.count({ where: { examId: exam.id } });
  return res.json({
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      questionCount,
      completed: Boolean(completed)
    }
  });
});

const getQuestions = asyncHandler(async (req, res) => {
  const exam = await getPublishedExam(req.params.examId);
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  if (await Result.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } })) {
    return res.status(409).json({ message: "This exam has already been submitted." });
  }

  let attempt = await ExamAttempt.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } });
  if (!attempt) {
    attempt = await ExamAttempt.create({
      candidateId: req.candidate.id,
      examId: exam.id,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + exam.duration * 60 * 1000)
    });
  }

  const [questions, answers] = await Promise.all([
    Question.findAll({ where: { examId: exam.id }, attributes: ["id", "questionText", "options", "marks"], order: [["createdAt", "ASC"]] }),
    Answer.findAll({ where: { candidateId: req.candidate.id, examId: exam.id }, attributes: ["questionId", "selectedOption"] })
  ]);
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]));

  return res.json({
    questions: questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      selectedOption: answerMap.has(q.id) ? answerMap.get(q.id) : null
    })),
    timeRemainingSeconds: Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000))
  });
});

const saveAnswer = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { questionId, selectedOption } = req.body;
  if (!questionId || isNaN(Number(questionId)) || !Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) {
    return res.status(400).json({ message: "Provide a valid questionId and selectedOption from 0 to 3." });
  }
  const exam = await getPublishedExam(examId);
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  if (await Result.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } })) {
    return res.status(409).json({ message: "This exam has already been submitted." });
  }
  const attempt = await ExamAttempt.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } });
  if (!attempt) return res.status(409).json({ message: "Start the exam before saving answers." });
  if (new Date(attempt.expiresAt) <= new Date()) return res.status(410).json({ message: "The exam time has expired." });
  if (!(await Question.findOne({ where: { id: questionId, examId: exam.id } }))) {
    return res.status(400).json({ message: "The question does not belong to this exam." });
  }

  const [answer] = await Answer.upsert({ candidateId: req.candidate.id, examId: exam.id, questionId, selectedOption });
  return res.json({ message: "Answer saved.", answer: { questionId, selectedOption } });
});

const submitExam = asyncHandler(async (req, res) => {
  const exam = await getPublishedExam(req.params.examId);
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  const existingResult = await Result.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } });
  if (existingResult) return res.status(409).json({ message: "This exam has already been submitted.", result: existingResult });

  const attempt = await ExamAttempt.findOne({ where: { candidateId: req.candidate.id, examId: exam.id } });
  if (!attempt) return res.status(409).json({ message: "Start the exam before submitting it." });

  const [questions, answers] = await Promise.all([
    Question.findAll({ where: { examId: exam.id }, attributes: ["id", "correctAnswer", "marks"] }),
    Answer.findAll({ where: { candidateId: req.candidate.id, examId: exam.id }, attributes: ["questionId", "selectedOption"] })
  ]);
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOption]));
  const marksObtained = questions.reduce(
    (total, q) => total + (answerMap.get(q.id) === q.correctAnswer ? q.marks : 0),
    0
  );
  const percentage = Number(((marksObtained / exam.totalMarks) * 100).toFixed(2));

  const result = await Result.create({
    candidateId: req.candidate.id,
    examId: exam.id,
    marksObtained,
    totalMarks: exam.totalMarks,
    percentage,
    passed: marksObtained >= exam.passMarks,
    submittedAt: new Date()
  });
  return res.status(201).json({ message: "Exam submitted successfully.", result });
});

const getResult = asyncHandler(async (req, res) => {
  const exam = await getPublishedExam(req.params.examId);
  if (!exam) return res.status(404).json({ message: "Exam not found." });
  const result = await Result.findOne({
    where: { candidateId: req.candidate.id, examId: exam.id },
    include: [{ model: Exam, attributes: ["title", "totalMarks", "passMarks"] }]
  });
  if (!result) return res.status(404).json({ message: "No result is available for this exam yet." });
  return res.json({ result });
});

const getHistory = asyncHandler(async (req, res) => {
  const results = await Result.findAll({
    where: { candidateId: req.candidate.id },
    include: [{ model: Exam, attributes: ["id", "title", "totalMarks", "passMarks"] }],
    order: [["submittedAt", "DESC"]]
  });
  return res.json({ results });
});

module.exports = { listExams, getExam, getQuestions, saveAnswer, submitExam, getResult, getHistory };
