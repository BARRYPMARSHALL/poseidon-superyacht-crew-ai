import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api, setToken, getToken } from './lib/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CrewList from './pages/CrewList';
import CrewDetail from './pages/CrewDetail';
import CertTracker from './pages/CertTracker';
import AlertsPage from './pages/AlertsPage';
import CompliancePage from './pages/CompliancePage';
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
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚓</div>
          <div className="text-gold-400 text-lg font-semibold">Poseidon</div>
          <div className="text-slate-400 text-sm mt-2">Superyacht Crew AI</div>
          <div className="mt-4 w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={getToken() ? <Navigate to="/" replace /> : <Login setUser={setUser} />} />
        <Route path="/" element={<ProtectedRoute><Layout user={user} setUser={setUser} /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="crew" element={<CrewList />} />
          <Route path="crew/:crewId" element={<CrewDetail />} />
          <Route path="certs" element={<CertTracker />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="compliance" element={<CompliancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
