import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceId?: string;
  features: string[];
}

export default function Subscribe() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getPlans()
      .then(res => setPlans(res.plans))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    setCheckingOut(planId);
    setError('');
    try {
      const successUrl = `${window.location.origin}/app`;
      const cancelUrl = `${window.location.origin}/subscribe`;
      const res = await api.createCheckout(planId, successUrl, cancelUrl);
      window.location.href = res.url;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
      setCheckingOut(null);
    }
  };

  const benefits = [
    { icon: '🐕', text: 'Cerberus — scans every cert every 6 hours. Alerts at 90, 60, 30, 14, 7, and 1 days.' },
    { icon: '🌊', text: 'Nereus — rotation scheduling. Schengen 90/180 day tracking. No overstays.' },
    { icon: '📨', text: 'Hermes — monthly owner reports. Onboarding/offboarding. Port clearance docs.' },
    { icon: '💰', text: 'Plutus — multi-currency payroll, SEA templates, budget vs. actual.' },
    { icon: '🎓', text: 'Mentor — job descriptions, CV screening, career development plans.' },
  ];

  return (
    <div className="min-h-screen bg-[#060d1a] text-[#f0ede5] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-4xl mb-4">⚓</div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
            Choose Your Plan
          </h1>
          <p className="text-[#8b9bb4] text-lg">Pick the plan that fits your vessel. Upgrade or cancel anytime.</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm text-center">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[#8b9bb4] text-sm mt-4">Loading plans...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-8 border transition-all relative ${
                  plan.id === 'captain'
                    ? 'bg-[#0f1f3d] border-[#c9a84c]/30 shadow-[0_0_40px_rgba(201,168,76,0.1)] scale-[1.02]'
                    : 'bg-[#0a1628] border-white/5 hover:border-white/10'
                }`}
              >
                {plan.id === 'captain' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a84c] text-[#060d1a] text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white font-mono">€{plan.price}</span>
                  <span className="text-[#8b9bb4]">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-[#8b9bb4]">
                      <span className="text-[#c9a84c] mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={checkingOut === plan.id}
                  className={`w-full py-3.5 rounded-lg font-bold text-base transition-all disabled:opacity-50 ${
                    plan.id === 'captain'
                      ? 'bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a]'
                      : 'border-2 border-[#c9a84c]/30 text-[#c9a84c] hover:border-[#c9a84c]'
                  }`}
                >
                  {checkingOut === plan.id ? 'Opening Stripe...' : `Subscribe — €${plan.price}/mo`}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-2xl font-bold text-center mb-8" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
            What You're Getting
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-[#0a1628] border border-white/5 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{b.icon}</span>
                <p className="text-sm text-[#8b9bb4] leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[#8b9bb4]/60 text-sm mb-4">Not ready to subscribe?</p>
          <button
            onClick={() => navigate('/app')}
            className="text-[#c9a84c] hover:underline text-sm font-medium"
          >
            Continue with free trial →
          </button>
        </div>
      </div>
    </div>
  );
}
