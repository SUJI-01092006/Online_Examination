import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import InstructionsPage from "./pages/InstructionsPage";
import ResultPage from "./pages/ResultPage";
import TakeExamPage from "./pages/TakeExamPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/exams/:examId" element={<InstructionsPage />} />
          <Route path="/exams/:examId/take" element={<TakeExamPage />} />
          <Route path="/exams/:examId/result" element={<ResultPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
