import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { setToken } from '../lib/api';

/* ─── SVG Icons (luxury style, 22x22 viewBox) ─── */

const IconDashboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconCrew = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconCerts = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconAlerts = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconCompliance = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconRotations = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconFinance = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <path d="M8 14h.01" strokeWidth="2" />
    <path d="M12 14h.01" strokeWidth="2" />
    <path d="M16 14h.01" strokeWidth="2" />
  </svg>
);

const IconRecruitment = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const IconAgentLog = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="15" rx="2" ry="2" />
    <circle cx="8" cy="9" r="2" />
    <path d="M16.5 9.5 14 12l2.5 2.5" />
    <path d="M12 14h4" />
    <path d="M2 17v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
  </svg>
);

const IconOwner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ─── Navigation Items ─── */

const navItems = [
  { to: '/app', label: 'Bridge', icon: IconDashboard },
  { to: '/app/crew', label: 'Crew', icon: IconCrew },
  { to: '/app/certs', label: 'Certs', icon: IconCerts },
  { to: '/app/alerts', label: 'Alerts', icon: IconAlerts },
  { to: '/app/compliance', label: 'Compliance', icon: IconCompliance },
  { to: '/app/rotations', label: 'Rotations', icon: IconRotations },
  { to: '/app/payroll', label: 'Finance', icon: IconFinance },
  { to: '/app/recruitment', label: 'Recruitment', icon: IconRecruitment },
  { to: '/app/agent-log', label: 'Agent Log', icon: IconAgentLog },
  { to: '/app/owner', label: 'Owner', icon: IconOwner },
];

/* ─── Layout Component ─── */

export default function Layout({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex">
        {/* Sidebar */}
        <aside
          className="glass-strong flex flex-col"
          style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Brand Header */}
          <div
            className="flex items-center gap-3 p-5"
            style={{ borderBottom: '1px solid var(--border-glass)' }}
          >
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" stroke="var(--brass-500)" strokeWidth="2" fill="none" />
              <polygon points="50,18 68,68 32,68" fill="var(--brass-500)" opacity="0.8" />
              <line x1="50" y1="68" x2="50" y2="82" stroke="var(--brass-500)" strokeWidth="2" />
              <line x1="50" y1="82" x2="35" y2="88" stroke="var(--brass-500)" strokeWidth="1.5" />
              <line x1="50" y1="82" x2="65" y2="88" stroke="var(--brass-500)" strokeWidth="1.5" />
            </svg>
            <div>
              <div style={{ color: 'var(--brass-500)', fontWeight: 600, fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>
                Poseidon
              </div>
              <div style={{ color: 'var(--navy-300)', fontSize: '0.65rem', letterSpacing: '0.04em' }}>
                Superyacht Crew AI
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-md) var(--space-sm)' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  className={() =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? 'var(--brass-500)' : 'var(--navy-200)',
                    background: isActive ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(201, 168, 76, 0.2)' : '1px solid transparent',
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive ? 500 : 400,
                    marginBottom: '2px',
                  })}
                >
                  <span style={{ opacity: 0.85, flexShrink: 0 }}>
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div
            className="p-4"
            style={{ borderTop: '1px solid var(--border-glass)' }}
          >
            <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, var(--brass-500), var(--brass-400))',
                  color: 'var(--text-on-brass)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-body)',
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div
                  className="truncate"
                  style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  {user?.name || 'Captain'}
                </div>
                <div
                  className="truncate capitalize"
                  style={{ color: 'var(--navy-300)', fontSize: '0.75rem' }}
                >
                  {user?.role || 'captain'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  color: 'var(--navy-300)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 150ms',
                  flexShrink: 0,
                }}
                className="logout-btn"
                title="Disembark"
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 overflow-auto"
          style={{
            marginLeft: 'var(--sidebar-width)',
            minHeight: '100vh',
          }}
        >
          <div className="p-6" style={{ maxWidth: 'var(--max-width)', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
