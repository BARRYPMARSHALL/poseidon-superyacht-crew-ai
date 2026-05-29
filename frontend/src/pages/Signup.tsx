import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../lib/api';

export default function Signup({ setUser }: { setUser: (u: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register(email, password, name, 'captain');
      setToken(res.token);
      setUser(res.user);
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#060d1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚓</div>
          <h1 className="font-serif text-3xl font-bold text-white mb-3" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Welcome Aboard, {name}</h1>
          <p className="text-[#8b9bb4] mb-8 leading-relaxed">
            Your 30-day free trial is active. Your vessel <strong className="text-[#f0ede5]">{vesselName || 'M/Y OCEAN STAR'}</strong> is ready.
          </p>
          <div className="bg-[#0a1628] border border-[#c9a84c]/20 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-[#c9a84c] font-semibold text-sm mb-4">What happens next:</h3>
            <ol className="space-y-3 text-sm text-[#8b9bb4]">
              <li className="flex gap-3">
                <span className="text-[#c9a84c] font-bold">1.</span>
                <span>You're looking at the Bridge. Cerberus is already scanning your demo crew.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#c9a84c] font-bold">2.</span>
                <span>Add your real crew or email us your spreadsheet — we'll migrate it within 48 hours.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#c9a84c] font-bold">3.</span>
                <span>Check your alerts in 6 hours. Cerberus will have found any expiring certs.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#c9a84c] font-bold">4.</span>
                <span>If you love it, pick a plan. If not, cancel anytime. No questions.</span>
              </li>
            </ol>
          </div>
          <button
            onClick={() => navigate('/subscribe')}
            className="w-full bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a] font-bold py-3.5 rounded-xl text-lg transition-all mb-3"
          >
            Choose a Plan →
          </button>
          <button
            onClick={() => navigate('/app')}
            className="w-full border-2 border-[#c9a84c]/30 text-[#c9a84c] hover:border-[#c9a84c] font-bold py-3.5 rounded-xl text-lg transition-all"
          >
            Start Free Trial Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl hover:opacity-80 transition-opacity">⚓</Link>
          <h1 className="font-serif text-2xl font-bold text-white mt-3" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>Start Your Free Trial</h1>
          <p className="text-[#8b9bb4] text-sm mt-2">30 days. No credit card. Full access.</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#0a1628] rounded-xl p-6 border border-white/5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-[#8b9bb4] mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Captain James Mitchell"
              className="w-full bg-[#060d1a] border border-white/10 rounded-lg px-4 py-2.5 text-[#f0ede5] placeholder:text-[#8b9bb4]/40 focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
              required
            />
          </div>

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

          <div className="mb-4">
            <label className="block text-xs text-[#8b9bb4] mb-1.5 uppercase tracking-wider">Vessel Name (optional)</label>
            <input
              type="text"
              value={vesselName}
              onChange={e => setVesselName(e.target.value)}
              placeholder="M/Y OCEAN STAR"
              className="w-full bg-[#060d1a] border border-white/10 rounded-lg px-4 py-2.5 text-[#f0ede5] placeholder:text-[#8b9bb4]/40 focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs text-[#8b9bb4] mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-[#060d1a] border border-white/10 rounded-lg px-4 py-2.5 text-[#f0ede5] placeholder:text-[#8b9bb4]/40 focus:outline-none focus:border-[#c9a84c]/50 transition-colors text-sm"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a] font-bold py-3 rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {loading ? 'Creating your account...' : 'Start Free Trial →'}
          </button>

          <p className="text-xs text-[#8b9bb4]/50 text-center mt-4">
            Already have an account? <Link to="/login" className="text-[#c9a84c] hover:underline">Sign in</Link>
          </p>
        </form>

        <div className="mt-6 flex justify-center gap-6 text-xs text-[#8b9bb4]/40">
          <span>✓ 30-day trial</span>
          <span>✓ No credit card</span>
          <span>✓ Cancel anytime</span>
        </div>
      </div>
    </div>
  );
}
