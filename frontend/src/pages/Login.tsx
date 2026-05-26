import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';

export default function Login({ setUser }: { setUser: (u: any) => void }) {
  const [email, setEmail] = useState('captain@oceanstar.yacht');
  const [password, setPassword] = useState('captain123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚓</div>
          <h1 className="text-3xl font-bold text-gold-400">Poseidon</h1>
          <p className="text-slate-400 mt-1">Superyacht Crew AI</p>
        </div>
        <form onSubmit={handleLogin} className="bg-navy-800 rounded-xl p-6 shadow-xl border border-navy-600">
          <h2 className="text-lg font-semibold text-white mb-4">Captain Login</h2>
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400 transition-colors"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Board Vessel'}
          </button>
          <p className="text-xs text-slate-500 text-center mt-4">
            Demo: captain@oceanstar.yacht / captain123
          </p>
        </form>
      </div>
    </div>
  );
}
