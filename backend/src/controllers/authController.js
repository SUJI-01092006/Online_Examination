const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");
const asyncHandler = require("../utils/asyncHandler");

function createToken(candidate) {
  return jwt.sign({ sub: candidate.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return res.status(400).json({ message: "Provide a name, valid email, and password between 8 and 72 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await Candidate.findOne({ where: { email: normalizedEmail } })) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  const candidate = await Candidate.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12)
  });

  return res.status(201).json({
    token: createToken(candidate),
    candidate: { id: candidate.id, name: candidate.name, email: candidate.email }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required." });
  }
  const candidate = await Candidate.findOne({ where: { email: email.trim().toLowerCase() } });
  if (!candidate || !(await bcrypt.compare(password, candidate.password))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  return res.json({
    token: createToken(candidate),
    candidate: { id: candidate.id, name: candidate.name, email: candidate.email }
  });
});

module.exports = { register, login };
