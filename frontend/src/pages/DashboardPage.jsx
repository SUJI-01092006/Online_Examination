import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import StatusMessage from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { candidate } = useAuth();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/exams")
      .then(({ data }) => setExams(data.exams))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-700">CANDIDATE DASHBOARD</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Hello, {candidate?.name?.split(" ")[0]} 👋</h1>
          <p className="mt-2 text-slate-500">Choose an assessment and do your best.</p>
        </div>
        <Link to="/history" className="text-sm font-semibold text-blue-700 hover:text-blue-900">View exam history →</Link>
      </div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Available exams</h2>
        {!loading && <span className="text-sm text-slate-500">{exams.length} assessments</span>}
      </div>
      {error && <StatusMessage error>{error}</StatusMessage>}
      {loading ? <p className="py-12 text-center text-slate-500">Loading exams...</p> : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">There are no published exams right now.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {exams.map((exam) => (
            <article key={exam.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Assessment</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{exam.title}</h3>
                </div>
                <span className={`status-pill ${exam.completed ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{exam.completed ? "Completed" : "Available"}</span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{exam.description}</p>
              <div className="my-5 flex gap-6 border-y border-slate-100 py-4 text-sm">
                <div><p className="text-slate-400">Duration</p><p className="mt-1 font-semibold text-slate-800">{exam.duration} min</p></div>
                <div><p className="text-slate-400">Total marks</p><p className="mt-1 font-semibold text-slate-800">{exam.totalMarks}</p></div>
                <div><p className="text-slate-400">Pass marks</p><p className="mt-1 font-semibold text-slate-800">{exam.passMarks}</p></div>
              </div>
              <Link className={exam.completed ? "secondary-button w-full" : "primary-button w-full"} to={exam.completed ? `/exams/${exam.id}/result` : `/exams/${exam.id}`}>
                {exam.completed ? "View result" : "View details"}
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
