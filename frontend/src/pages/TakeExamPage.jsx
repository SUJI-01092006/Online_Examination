import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import StatusMessage from "../components/StatusMessage";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);

  useEffect(() => {
    api.get(`/exams/${examId}/questions`)
      .then(({ data }) => {
        setQuestions(data.questions);
        setRemaining(data.timeRemainingSeconds);
      })
      .catch((requestError) => {
        const message = getErrorMessage(requestError);
        if (requestError.response?.status === 409) navigate(`/exams/${examId}/result`, { replace: true });
        else setError(message);
      })
      .finally(() => setLoading(false));
  }, [examId, navigate]);

  const submitExam = useCallback(async (automatic = false) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/exams/${examId}/submit`);
      navigate(`/exams/${examId}/result`, { replace: true, state: { automatic } });
    } catch (requestError) {
      if (requestError.response?.status === 409) navigate(`/exams/${examId}/result`, { replace: true });
      else {
        setError(getErrorMessage(requestError));
        if (automatic) setAutoSubmitFailed(true);
        submitLock.current = false;
        setSubmitting(false);
      }
    }
  }, [examId, navigate]);

  useEffect(() => {
    if (remaining === null || loading || submitting) return undefined;
    if (remaining <= 0) {
      if (!saving && !autoSubmitFailed) submitExam(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setRemaining((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining, loading, saving, submitting, autoSubmitFailed, submitExam]);

  async function selectAnswer(option) {
    const question = questions[current];
    if (!question || saving || submitting) return;
    setError("");
    setQuestions((items) => items.map((item, index) => index === current ? { ...item, selectedOption: option } : item));
    setSaving(true);
    try {
      await api.post(`/exams/${examId}/answers`, { questionId: question.id, selectedOption: option });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-16 text-center text-slate-500">Preparing your exam...</p>;
  if (!questions.length) return <div className="mx-auto max-w-2xl">{error && <StatusMessage error>{error}</StatusMessage>}</div>;

  const question = questions[current];
  const answeredCount = questions.filter((item) => item.selectedOption !== null).length;
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div><p className="text-sm text-slate-500">Question {current + 1} of {questions.length}</p><p className="mt-1 font-semibold text-slate-800">{answeredCount} of {questions.length} answered</p></div>
        <div className={`rounded-xl px-4 py-2 text-lg font-bold tabular-nums ${remaining < 60 ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"}`} aria-label="Time remaining">⏱ {formatTime(remaining ?? 0)}</div>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      {error && <div className="mb-5"><StatusMessage error>{error}</StatusMessage></div>}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="flex items-center justify-between">
          <span className="status-pill bg-blue-50 text-blue-700">Question {current + 1}</span>
          <span className="text-sm text-slate-500">{question.marks} mark{question.marks === 1 ? "" : "s"}</span>
        </div>
        <h1 className="mt-6 text-xl font-semibold leading-8 text-slate-900 sm:text-2xl">{question.questionText}</h1>
        <div className="mt-7 space-y-3">
          {question.options.map((option, index) => (
            <button key={index} type="button" disabled={saving || submitting} onClick={() => selectAnswer(index)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${question.selectedOption === index ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${question.selectedOption === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{letters[index]}</span>
              <span className="text-sm font-medium text-slate-800">{option}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <button className="secondary-button" disabled={current === 0 || saving} onClick={() => setCurrent((index) => index - 1)}>← Previous</button>
          <span className="text-xs text-slate-500">{saving ? "Saving answer..." : "Answers are saved automatically"}</span>
          {current < questions.length - 1 ? (
            <button className="primary-button" disabled={saving} onClick={() => setCurrent((index) => index + 1)}>Next →</button>
          ) : (
            <button className="primary-button bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500" disabled={saving || submitting} onClick={() => submitExam(false)}>{submitting ? "Submitting..." : "Submit exam"}</button>
          )}
        </div>
      </section>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {questions.map((item, index) => <button key={item.id} aria-label={`Go to question ${index + 1}`} onClick={() => setCurrent(index)} className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-semibold ${index === current ? "bg-blue-700 text-white" : item.selectedOption !== null ? "bg-emerald-100 text-emerald-800" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{index + 1}</button>)}
      </div>
      <div className="mt-5 text-center"><button className="text-sm font-medium text-red-600 hover:text-red-800" disabled={saving || submitting} onClick={() => submitExam(false)}>Submit exam now</button></div>
    </div>
  );
}
