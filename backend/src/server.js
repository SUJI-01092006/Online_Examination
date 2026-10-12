require("dotenv").config();
const app = require("./app");
const { connectDatabase } = require("./config/db");

const port = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a secret at least 32 characters long.");
}

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Online Exam API listening on port ${port}`));
  })
  .catch((error) => {
    console.error("Failed to start the API:", error);
    process.exitCode = 1;
  });
