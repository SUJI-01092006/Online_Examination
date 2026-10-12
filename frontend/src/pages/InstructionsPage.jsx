import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import StatusMessage from "../components/StatusMessage";

export default function InstructionsPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/exams/${examId}`)
      .then(({ data }) => setExam(data.exam))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [examId]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to exams</Link>
      {error ? <div className="mt-6"><StatusMessage error>{error}</StatusMessage></div> : !exam ? <p className="py-12 text-center text-slate-500">Loading exam details...</p> : (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <span className="status-pill bg-blue-50 text-blue-700">Exam instructions</span>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{exam.title}</h1>
          <p className="mt-3 leading-7 text-slate-500">{exam.description}</p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Duration", `${exam.duration} min`], ["Questions", exam.questionCount], ["Total marks", exam.totalMarks], ["Pass marks", exam.passMarks]].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>
            ))}
          </div>
          <div className="my-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-900">Before you begin</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-amber-900/80">
              <li>Your timer starts as soon as you start the exam and keeps running if you refresh.</li>
              <li>Your selected answers are saved automatically. You can move between questions.</li>
              <li>When the timer ends, the exam is submitted automatically.</li>
              <li>You can submit this exam only once. Correct answers are not shown during the exam.</li>
            </ul>
          </div>
          {exam.completed ? (
            <button className="primary-button w-full" onClick={() => navigate(`/exams/${examId}/result`)}>View your result</button>
          ) : (
            <button className="primary-button w-full" onClick={() => navigate(`/exams/${examId}/take`)}>Start exam</button>
          )}
        </section>
      )}
    </div>
  );
}
