import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { candidate, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3 font-bold text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-lg text-white">E</span>
            <span className="text-xl tracking-tight">Examly</span>
          </Link>
          {candidate && (
            <nav className="flex items-center gap-5 text-sm font-medium">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}>Exams</NavLink>
              <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}>My results</NavLink>
              <span className="hidden text-slate-500 sm:inline">{candidate.name}</span>
              <button className="text-slate-500 hover:text-blue-700" onClick={handleLogout}>Sign out</button>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      <footer className="mt-12 border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        Examly · Online Examination and Live Result Platform
      </footer>
    </div>
  );
}
