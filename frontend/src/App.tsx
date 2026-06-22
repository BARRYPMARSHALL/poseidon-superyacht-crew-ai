import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, setToken, getToken } from './lib/api';
import '../src/styles/theme.css';
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
import Subscribe from './pages/Subscribe';
import Layout from './components/Layout';
import OwnerDashboard from './pages/OwnerDashboard';

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
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" style={{ margin: '0 auto 16px' }}>
            <circle cx="50" cy="50" r="46" stroke="var(--brass-500)" strokeWidth="2" fill="none" opacity="0.3" />
            <polygon points="50,18 68,68 32,68" fill="var(--brass-500)" opacity="0.8" />
          </svg>
          <div
            style={{
              color: 'var(--brass-500)',
              fontSize: '1.5rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
            }}
          >
            Poseidon
          </div>
          <div style={{ color: 'var(--navy-200)', fontSize: '0.875rem', marginTop: '4px' }}>
            Superyacht Crew AI
          </div>
          <div
            style={{
              margin: '20px auto 0',
              width: 32,
              height: 32,
              border: '3px solid var(--brass-500)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
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
        <Route path="/subscribe" element={getToken() ? <Subscribe /> : <Navigate to="/login" replace />} />

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
          <Route path="owner" element={<OwnerDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
