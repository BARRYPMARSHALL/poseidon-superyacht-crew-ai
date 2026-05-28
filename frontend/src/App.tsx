import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, setToken, getToken } from './lib/api';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CrewList from './pages/CrewList';
import CrewDetail from './pages/CrewDetail';
import CertTracker from './pages/CertTracker';
import AlertsPage from './pages/AlertsPage';
import CompliancePage from './pages/CompliancePage';
import AgentLogPage from './pages/AgentLogPage';
import PayrollPage from './pages/PayrollPage';
import RecruitmentPage from './pages/RecruitmentPage';
import RotationPage from './pages/RotationPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      api.me().then(res => {
        setUser(res.user);
        setLoading(false);
      }).catch(() => {
        setToken(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚓</div>
          <div className="text-[#c9a84c] text-lg font-semibold">Poseidon</div>
          <div className="text-[#8b9bb4] text-sm mt-2">Superyacht Crew AI</div>
          <div className="mt-4 w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={getToken() ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/login" element={getToken() ? <Navigate to="/app" replace /> : <Login setUser={setUser} />} />
        <Route path="/signup" element={getToken() ? <Navigate to="/app" replace /> : <Signup setUser={setUser} />} />

        {/* Protected app routes */}
        <Route path="/app" element={<ProtectedRoute><Layout user={user} setUser={setUser} /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="crew" element={<CrewList />} />
          <Route path="crew/:crewId" element={<CrewDetail />} />
          <Route path="certs" element={<CertTracker />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="agent-log" element={<AgentLogPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="recruitment" element={<RecruitmentPage />} />
          <Route path="rotations" element={<RotationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
