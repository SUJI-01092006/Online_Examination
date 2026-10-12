import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import StatusMessage from "../components/StatusMessage";

export default function ResultPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/exams/${examId}/result`)
      .then(({ data }) => setResult(data.result))
      .catch((requestError) => {
        if (requestError.response?.status === 404) navigate("/", { replace: true });
        else setError(getErrorMessage(requestError));
      });
  }, [examId, navigate]);

  if (error) return <div className="mx-auto max-w-2xl"><StatusMessage error>{error}</StatusMessage></div>;
  if (!result) return <p className="py-16 text-center text-slate-500">Calculating your result...</p>;

  const examTitle = result.exam?.title || "Exam";
  return (
    <div className="mx-auto max-w-2xl">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className={`px-8 py-10 text-center ${result.passed ? "bg-emerald-50" : "bg-amber-50"}`}>
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-2xl font-bold ${result.passed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{result.passed ? "✓" : "!"}</div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-slate-500">{location.state?.automatic ? "Time is up — exam submitted" : "Exam submitted"}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{result.passed ? "Congratulations!" : "Keep practicing"}</h1>
          <p className="mt-2 text-slate-600">{examTitle}</p>
        </div>
        <div className="p-7 sm:p-9">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[["Marks obtained", `${result.marksObtained} / ${result.totalMarks}`], ["Percentage", `${result.percentage}%`], ["Status", result.passed ? "Passed" : "Not passed"]].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 text-lg font-bold ${label === "Status" ? result.passed ? "text-emerald-700" : "text-amber-700" : "text-slate-900"}`}>{value}</p></div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">Submitted {new Date(result.submittedAt).toLocaleString()}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/" className="primary-button flex-1">Back to dashboard</Link>
            <Link to="/history" className="secondary-button flex-1">View exam history</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
