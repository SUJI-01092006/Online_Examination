const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  listExams,
  getExam,
  getQuestions,
  saveAnswer,
  submitExam,
  getResult,
  getHistory
} = require("../controllers/examController");

const router = express.Router();
router.use(requireAuth);
router.get("/", listExams);
router.get("/history", getHistory);
router.get("/:examId", getExam);
router.get("/:examId/questions", getQuestions);
router.post("/:examId/answers", saveAnswer);
router.post("/:examId/submit", submitExam);
router.get("/:examId/result", getResult);

module.exports = router;
