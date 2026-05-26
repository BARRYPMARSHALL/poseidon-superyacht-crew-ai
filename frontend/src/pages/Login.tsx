import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';

export default function Login({ setUser }: { setUser: (u: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl hover:opacity-80 transition-opacity">⚓</Link>
          <h1 className="font-serif text-2xl font-bold text-white mt-3" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Welcome Back, Captain</h1>
          <p className="text-[#8b9bb4] text-sm mt-2">Sign in to your bridge</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#0a1628] rounded-xl p-6 border border-white/5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-[#8b9bb4] mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="captain@youryacht.com"
              className="w-full bg-[#060d1a] border border-white/10 rounded-lg px-4 py-2.5 text-[#f0ede5] placeholder:text-[#8b9bb4]/40 focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs text-[#8b9bb4] mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#060d1a] border border-white/10 rounded-lg px-4 py-2.5 text-[#f0ede5] placeholder:text-[#8b9bb4]/40 focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a] font-bold py-3 rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Authenticating...' : 'Board Vessel →'}
          </button>

          <p className="text-xs text-[#8b9bb4]/50 text-center mt-4">
            Don't have an account? <Link to="/signup" className="text-[#c9a84c] hover:underline">Start free trial</Link>
          </p>
        </form>

        <div className="mt-6 p-4 bg-[#0a1628]/50 rounded-lg border border-white/5">
          <p className="text-xs text-[#8b9bb4]/60 text-center">
            <span className="text-[#8b9bb4]">Demo credentials:</span> captain@oceanstar.yacht / captain123
          </p>
        </div>
      </div>
    </div>
  );
}
