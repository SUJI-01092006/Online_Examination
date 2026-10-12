require("dotenv").config();
const { connectDatabase } = require("./config/db");
const Exam = require("./models/Exam");
const Question = require("./models/Question");

const samples = [
  {
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of core JavaScript syntax, types, and browser concepts.",
    duration: 20,
    totalMarks: 5,
    passMarks: 3,
    questions: [
      ["Which keyword declares a block-scoped variable that can be reassigned?", ["const", "let", "static", "final"], 1],
      ["What does typeof null return in JavaScript?", ["null", "undefined", "object", "boolean"], 2],
      ["Which array method creates a new array by transforming each item?", ["filter()", "reduce()", "map()", "forEach()"], 2],
      ["What is the result of Boolean(0)?", ["true", "false", "0", "undefined"], 1],
      ["Which syntax creates a Promise?", ["new Promise((resolve) => resolve())", "Promise.create()", "async Promise()", "make Promise()"], 0]
    ]
  },
  {
    title: "Web and Networking Basics",
    description: "A short assessment covering HTTP, HTML, CSS, and essential networking.",
    duration: 20,
    totalMarks: 5,
    passMarks: 3,
    questions: [
      ["Which HTTP method is typically used to retrieve a resource?", ["POST", "PATCH", "GET", "DELETE"], 2],
      ["What does CSS stand for?", ["Computer Style Sheets", "Cascading Style Sheets", "Creative Styling System", "Colorful Style Syntax"], 1],
      ["Which status code means a request succeeded?", ["200", "301", "404", "500"], 0],
      ["Which HTML element is used for the main page heading?", ["<head>", "<h1>", "<title>", "<header>"], 1],
      ["What does DNS primarily do?", ["Encrypts web traffic", "Maps domain names to IP addresses", "Stores browser cookies", "Compresses web pages"], 1]
    ]
  }
];

async function seed() {
  await connectDatabase();
  for (const sample of samples) {
    let exam = await Exam.findOne({ where: { title: sample.title } });
    if (!exam) {
      exam = await Exam.create({
        title: sample.title,
        description: sample.description,
        duration: sample.duration,
        totalMarks: sample.totalMarks,
        passMarks: sample.passMarks,
        status: "published"
      });
    }
    const existing = await Question.count({ where: { examId: exam.id } });
    if (existing > 0) continue;
    await Question.bulkCreate(sample.questions.map(([questionText, options, correctAnswer]) => ({
      examId: exam.id,
      questionText,
      options,
      correctAnswer,
      marks: 1
    })));
  }
  console.log("Seed complete: ensured 2 sample exams with 5 questions each.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
