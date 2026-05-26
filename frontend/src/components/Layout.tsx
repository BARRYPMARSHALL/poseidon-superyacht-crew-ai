import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { setToken } from '../lib/api';

const navItems = [
  { to: '/app', label: 'Bridge', icon: '🎯' },
  { to: '/app/crew', label: 'Crew', icon: '👥' },
  { to: '/app/certs', label: 'Certifications', icon: '📜' },
  { to: '/app/alerts', label: 'Alerts', icon: '🔔' },
  { to: '/app/compliance', label: 'Compliance', icon: '🛡️' },
];

export default function Layout({ user, setUser }: { user: any; setUser: (u: any) => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-800 border-r border-navy-600 flex flex-col">
        <div className="p-5 border-b border-navy-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚓</span>
            <div>
              <div className="text-gold-400 font-bold text-lg">Poseidon</div>
              <div className="text-slate-500 text-xs">Superyacht Crew AI</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    : 'text-slate-400 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center text-gold-400 text-sm font-bold">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{user?.name || 'Captain'}</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role || 'captain'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors text-lg"
              title="Disembark"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
