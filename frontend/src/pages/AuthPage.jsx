import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const registering = mode === "register";
  const { candidate, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (candidate) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (registering ? register(form) : login({ email: form.email, password: form.password }));
      navigate("/");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-blue-700 p-10 text-white md:flex">
        <div>
          <div className="mb-12 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-xl font-bold">E</div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Your next step starts here</p>
          <h1 className="text-4xl font-bold leading-tight">Learn. Test.<br />Achieve.</h1>
          <p className="mt-5 max-w-xs leading-7 text-blue-100">A focused space for online assessments and instant results.</p>
        </div>
        <p className="text-sm text-blue-100">A fair exam experience, from start to result.</p>
      </section>
      <section className="p-8 sm:p-10">
        <p className="text-sm font-semibold text-blue-700">{registering ? "CREATE AN ACCOUNT" : "CANDIDATE PORTAL"}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">{registering ? "Join Examly" : "Welcome back"}</h2>
        <p className="mt-2 text-sm text-slate-500">{registering ? "Register to access your exams." : "Sign in to continue to your dashboard."}</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {registering && (
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input required minLength="2" maxLength="80" className="form-input mt-2" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input required type="email" className="form-input mt-2" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input required type="password" minLength="8" maxLength="72" className="form-input mt-2" autoComplete={registering ? "new-password" : "current-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {registering && <span className="mt-1 block text-xs font-normal text-slate-500">Use at least 8 characters.</span>}
          </label>
          {error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button className="primary-button w-full" disabled={busy}>{busy ? "Please wait..." : registering ? "Create account" : "Sign in"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {registering ? "Already registered?" : "New to Examly?"}{" "}
          <Link className="font-semibold text-blue-700 hover:text-blue-800" to={registering ? "/login" : "/register"}>{registering ? "Sign in" : "Create an account"}</Link>
        </p>
      </section>
    </div>
  );
}
