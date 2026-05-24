import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DecorativeLogsBackground from "./components/DecorativeLogsBackground";
import AppChrome from "./components/AppChrome";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AppDetailPage from "./pages/AppDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg relative overflow-hidden">
        <DecorativeLogsBackground />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppChrome />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/apps/:name" element={<AppDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
