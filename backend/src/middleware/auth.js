const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

async function requireAuth(req, res, next) {
  const authorization = req.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication is required." });
  }

  try {
    const token = authorization.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const candidate = await Candidate.findByPk(payload.sub, { attributes: ["id", "name", "email"] });
    if (!candidate) {
      return res.status(401).json({ message: "The account for this token no longer exists." });
    }
    req.candidate = candidate;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session is invalid or expired. Please sign in again." });
    }
    return next(error);
  }
}

module.exports = requireAuth;
