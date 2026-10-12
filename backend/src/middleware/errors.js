function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);
  if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
  return res.status(500).json({ message: "An unexpected server error occurred." });
}

module.exports = { notFound, errorHandler };
