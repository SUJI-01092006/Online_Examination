# Online Examination and Live Result Platform

A student-friendly full-stack online exam app built with React, Vite, Tailwind CSS, Express, MongoDB, and Mongoose. Candidates can register, take a timed multiple-choice exam, save answers, submit once, and view results and exam history. Redis and message brokers are intentionally not required.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB locally, or a MongoDB Atlas connection string

## Setup

1. Start MongoDB locally, or create a MongoDB Atlas database. If MongoDB Community Server is installed as a Windows service, open an Administrator PowerShell terminal and run:

   ```powershell
   Get-Service MongoDB
   Start-Service MongoDB
   ```

   If the service is not installed, install MongoDB Community Server first. For Atlas, set `MONGODB_URI` to your cluster connection string in the backend `.env` file.
2. Configure the backend:

   ```powershell
   cd backend
   Copy-Item .env.example .env
   ```

   Edit `backend/.env` and set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters. Keep `.env` private.
3. Install backend dependencies, load sample exams, and start the API:

   ```powershell
   npm install
   npm run seed
   npm run dev
   ```

   The API listens on `http://localhost:5000`.
4. In a second terminal, install frontend dependencies and start Vite:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Open the URL printed by Vite (normally `http://localhost:5173`) and register a candidate account.

The seed script creates two published exams, each with five questions, if they are not already present. It does not delete existing records or create a demo candidate; register through the app.

## Available commands

### Backend (`backend/`)

- `npm run dev` — start the API with automatic restarts.
- `npm start` — start the API.
- `npm run seed` — reset sample exams and questions.

### Frontend (`frontend/`)

- `npm run dev` — start the Vite development server (proxies `/api` to port 5000).
- `npm run build` — create a production frontend build.
- `npm run preview` — preview the production build.

## API

All exam endpoints require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a candidate |
| POST | `/api/auth/login` | Authenticate a candidate |
| GET | `/api/exams` | List published exams and candidate completion status |
| GET | `/api/exams/:examId` | Get exam instructions/details |
| GET | `/api/exams/:examId/questions` | Start/resume an attempt and return questions without correct answers |
| POST | `/api/exams/:examId/answers` | Save or update a selected option |
| POST | `/api/exams/:examId/submit` | Submit once and calculate the result on the server |
| GET | `/api/exams/:examId/result` | Retrieve the candidate's result |
| GET | `/api/exams/history` | Retrieve the candidate's completed exam history |
| GET | `/api/health` | Check API health |

Attempt start and expiry are stored on the server, so refreshing does not restart the timer. Correct answers are selected only in the submission service and are never included in the question API response. Result uniqueness and answer uniqueness are enforced with MongoDB indexes.

## Project structure

```text
backend/
  src/config/       MongoDB configuration
  src/controllers/  Authentication and exam workflows
  src/middleware/   JWT authentication and error handling
  src/models/       Candidate, Exam, Question, Answer, Result, ExamAttempt
  src/routes/       REST routes
  src/seed.js       Sample exam data
frontend/
  src/components/   Shared layout and route components
  src/context/      Candidate authentication state
  src/pages/        Login, dashboard, instructions, exam, result, history
```
