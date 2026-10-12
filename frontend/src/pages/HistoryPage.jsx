import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import StatusMessage from "../components/StatusMessage";

export default function HistoryPage() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/exams/history")
      .then(({ data }) => setResults(data.results))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link to="/" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to dashboard</Link>
      <div className="mb-7 mt-4">
        <p className="text-sm font-semibold text-blue-700">YOUR PROGRESS</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Exam history</h1>
        <p className="mt-2 text-slate-500">Review the results of your completed assessments.</p>
      </div>
      {error && <StatusMessage error>{error}</StatusMessage>}
      {loading ? <p className="py-12 text-center text-slate-500">Loading your results...</p> : results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-800">No completed exams yet</p>
          <p className="mt-2 text-sm text-slate-500">Your results will show up here after you submit an exam.</p>
          <Link to="/" className="mt-5 inline-block text-sm font-semibold text-blue-700">Browse exams →</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-5 gap-4 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
            <span className="col-span-2">Exam</span><span>Score</span><span>Result</span><span>Submitted</span>
          </div>
          <div className="divide-y divide-slate-100">
            {results.map((result) => (
              <div key={result._id} className="grid gap-3 px-6 py-5 sm:grid-cols-5 sm:items-center sm:gap-4">
                <span className="font-semibold text-slate-900 sm:col-span-2">{result.exam?.title || "Exam"}</span>
                <span className="text-sm text-slate-600">{result.marksObtained}/{result.totalMarks} · {result.percentage}%</span>
                <span><span className={`status-pill ${result.passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{result.passed ? "Passed" : "Not passed"}</span></span>
                <span className="flex items-center justify-between text-sm text-slate-500">{new Date(result.submittedAt).toLocaleDateString()}<Link className="font-semibold text-blue-700 sm:hidden" to={`/exams/${result.exam?.id || result.examId}/result`}>View</Link></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
