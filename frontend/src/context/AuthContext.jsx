import { createContext, useContext, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [candidate, setCandidate] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("exam-candidate") || "null");
    } catch {
      return null;
    }
  });

  async function authenticate(path, values) {
    const { data } = await api.post(`/auth/${path}`, values);
    localStorage.setItem("exam-token", data.token);
    localStorage.setItem("exam-candidate", JSON.stringify(data.candidate));
    setCandidate(data.candidate);
    return data.candidate;
  }

  function logout() {
    localStorage.removeItem("exam-token");
    localStorage.removeItem("exam-candidate");
    setCandidate(null);
  }

  const value = useMemo(
    () => ({ candidate, register: (values) => authenticate("register", values), login: (values) => authenticate("login", values), logout }),
    [candidate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
