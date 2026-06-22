import { Link } from 'react-router-dom';

/* ── Inline SVG Icons (no emoji) ── */
type SvgProps = { className?: string; style?: React.CSSProperties };

const AnchorIcon = ({ className, style }: SvgProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 6v12" />
    <path d="M8 18h8" />
    <path d="M4 12a8 8 0 0 0 16 0" />
    <path d="M12 6a8 8 0 0 1 8 8" />
  </svg>
);

const ShipWheelIcon = ({ className, style }: SvgProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const CertShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const CheckIcon = ({ className, style }: SvgProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = ({ className, style }: SvgProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12c2-2 4 2 6 2s4-4 6-4 4 4 6 2" />
    <path d="M2 18c2-2 4 2 6 2s4-4 6-4 4 4 6 2" />
  </svg>
);

const CompassIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
  </svg>
);

const GraduateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const ArrowRightIcon = ({ className, style }: SvgProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ── Agent data ── */
interface Agent {
  icon: React.ReactNode;
  name: string;
  role: string;
  desc: string;
  schedule: string;
  color: string;
}

const agents: Agent[] = [
  {
    icon: <CertShieldIcon className="w-6 h-6" />,
    name: 'Cerberus',
    role: 'Certification & Compliance',
    desc: 'Scans every cert, passport, and visa every 6 hours. Alerts at 90, 60, 30, 14, 7, and 1 days. Knows STCW dependencies. Books renewal training. Generates MLC 2006 audits.',
    schedule: 'Every 6 hours',
    color: 'text-amber-400',
  },
  {
    icon: <WaveIcon className="w-6 h-6" />,
    name: 'Nereus',
    role: 'Rotation & Scheduling',
    desc: 'Tracks crew rotations. Monitors Schengen 90/180 day rule. Flags returning crew with expiring certs. Optimizes handovers. No more "I thought you had that covered."',
    schedule: 'Daily',
    color: 'text-teal-400',
  },
  {
    icon: <MailIcon className="w-6 h-6" />,
    name: 'Hermes',
    role: 'Reporting & Comms',
    desc: 'Generates monthly owner reports. Creates onboarding checklists. Manages offboarding. Drafts job posts when crew resign. Screens CVs. Prepares port clearance docs.',
    schedule: 'On demand',
    color: 'text-brass-400',
  },
  {
    icon: <WalletIcon className="w-6 h-6" />,
    name: 'Plutus',
    role: 'Payroll & Budget',
    desc: 'Multi-currency payroll, SEA templates, owner budget vs. actual reporting. Handles the numbers so you don\'t have to.',
    schedule: 'Weekly',
    color: 'text-emerald-400',
  },
  {
    icon: <GraduateIcon className="w-6 h-6" />,
    name: 'Mentor',
    role: 'Career & Retention',
    desc: 'Career development tracking, retention risk scoring, training recommendations. Keeps your best crew on board.',
    schedule: 'Weekly',
    color: 'text-sky-400',
  },
];

/* ── FAQ data ── */
const faqs = [
  { q: 'I already have YachtWyse / a spreadsheet. Why switch?', a: 'Those tools store your data. Poseidon acts on it. Your spreadsheet won\'t tell you Marco\'s PSCRB expires in 7 days. Poseidon will — and it\'ll suggest where to renew it based on where the vessel is.' },
  { q: 'Is my crew\'s data secure?', a: 'Encrypted at rest. Your data stays on your instance. We never access it, share it, or train on it. You control it.' },
  { q: 'What if I have unreliable internet at sea?', a: 'Poseidon works as a Progressive Web App with offline mode. Syncs when you\'re back in range. The agents run on our servers, so alerts still fire even when you\'re offline.' },
  { q: 'I\'m not technical. Can I use this?', a: 'If you can use WhatsApp and email, you can use Poseidon. We built it with captains. Plus: we\'ll onboard your crew data for you.' },
  { q: 'How long does setup take?', a: 'Send us your crew spreadsheet. We\'ll have you live within 48 hours. Most captains are fully operational in under 2 hours of their own time.' },
  { q: 'What if it makes a mistake?', a: 'Poseidon drafts. You approve. It never auto-submits to authorities. It never books a course without your confirmation. You\'re still in command.' },
];

/* ── Comparison data ── */
const comparisons = [
  { scenario: 'Cert about to expire', without: 'You remember. Maybe.', with: 'Cerberus alerted you 90 days ago. Reminded you yesterday.' },
  { scenario: 'MLC inspection tomorrow', without: '2 days of frantic paperwork. Hope nothing is missing.', with: 'One click. Findings + recommendations. Audit-ready.' },
  { scenario: 'Crew member resigns', without: 'Weekend writing a job post. Screening CVs manually.', with: 'Mentor drafts the JD, screens applicants, schedules interviews.' },
  { scenario: 'Owner wants monthly report', without: 'Sunday evening at your laptop.', with: 'Hermes drafted it. You review and send. 5 minutes.' },
  { scenario: 'Schengen days running low', without: 'Crew member tells you when it\'s too late.', with: 'Nereus alerts at 20 days. Rotation adjusted. No overstay.' },
];

/* ── Pricing data ── */
const plans = [
  { tier: 'Skipper', price: 499, crew: 'Up to 15', agents: 'Cerberus + Nereus', reports: 'Basic alerts', support: 'Email', highlight: false },
  { tier: 'Captain', price: 799, crew: 'Up to 30', agents: 'All 5 agents', reports: 'Full compliance + owner', support: 'Priority email', highlight: true },
  { tier: 'Fleet', price: null, crew: 'Unlimited', agents: 'All + white-label', reports: 'Fleet analytics', support: 'Dedicated + SLA', highlight: false },
];

/* ── Image URLs ── */
const IMAGES = {
  superyacht: 'https://images.pexels.com/photos/31383420/pexels-photo-31383420.jpeg?auto=compress&cs=tinysrgb&w=1920',
  captainWorking: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
  happyCaptain: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  oceanHorizon: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1200&q=80',
};

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      {/* ============================== NAV ============================== */}
      <nav className="glass-strong fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnchorIcon className="w-5 h-5" style={{ color: 'var(--brass-500)' }} />
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--brass-500)', fontFamily: 'var(--font-display)' }}>Poseidon</span>
            <span className="hidden sm:inline text-sm" style={{ color: 'var(--navy-200)' }}>Superyacht Crew AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm transition-colors" style={{ color: 'var(--navy-200)' }} onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--navy-200)')}>
              Sign In
            </Link>
            <Link to="/signup" className="brass-button text-sm !px-5 !py-2">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================== HERO ============================== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Superyacht background image with dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(3,10,30,0.85) 0%, rgba(3,10,30,0.60) 40%, rgba(3,10,30,0.85) 100%), url(${IMAGES.superyacht})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />
        {/* Radial glow overlay */}
        <div className="radial-glow absolute inset-0 opacity-40" />
        <div className="grid-pattern absolute inset-0 opacity-50" />

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
                <ShipWheelIcon className="w-4 h-4" />
                <span className="text-xs tracking-[0.2em] uppercase font-medium">For Superyacht Captains & Fleet Managers</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Your Crew.<br />
                Your Compliance.<br />
                Your Peace of Mind.<br />
                <span className="text-gradient">Handled.</span>
              </h1>
              <p className="text-lg mb-8 max-w-xl leading-relaxed" style={{ color: 'var(--navy-200)' }}>
                Poseidon is an AI chief officer that tracks every STCW certificate, MLC requirement,
                visa expiry, and crew rotation — so you stop doing admin at 10pm and start
                getting your leave back.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="brass-button text-lg !px-8 !py-4 text-center hover-scale">
                  Start Free Trial <ArrowRightIcon className="w-5 h-5 inline-block ml-2" />
                </Link>
                <a href="#pain" className="brass-button-outline text-lg !px-8 !py-4 text-center">
                  See How It Works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm" style={{ color: 'var(--navy-200)' }}>
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4" style={{ color: 'var(--teal-500)' }} /> 30-day free trial</span>
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4" style={{ color: 'var(--teal-500)' }} /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4" style={{ color: 'var(--teal-500)' }} /> Setup in 48 hours</span>
                <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4" style={{ color: 'var(--teal-500)' }} /> Cancel anytime</span>
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="relative hidden lg:block animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-elevated)' }}>
                <div style={{ backgroundColor: 'var(--navy-800)' }} className="p-6">
                  {/* Traffic lights + title */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f87171' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4ade80' }} />
                    <span className="ml-3 text-xs" style={{ color: 'var(--navy-200)', fontFamily: 'var(--font-mono)' }}>poseidon — bridge overview</span>
                  </div>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Active Crew', value: '16', color: 'var(--teal-500)' },
                      { label: 'Cert Health', value: '78%', color: 'var(--brass-500)' },
                      { label: 'Expiring ≤30d', value: '5', color: '#f87171' },
                      { label: 'Open Alerts', value: '4', color: 'var(--brass-500)' },
                    ].map((stat, i) => (
                      <div key={i} className="card !p-3 !border !bg-opacity-50" style={{ backgroundColor: 'var(--navy-700)' }}>
                        <div className="text-xs" style={{ color: 'var(--navy-200)' }}>{stat.label}</div>
                        <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Cert timeline */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs"><span style={{ color: 'var(--navy-200)' }}>Expired Certs</span><span style={{ color: '#f87171' }} className="font-mono">10</span></div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--navy-900)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: '20%', backgroundColor: '#f87171' }} />
                    </div>
                    <div className="flex justify-between text-xs"><span style={{ color: 'var(--navy-200)' }}>Expiring ≤30d</span><span style={{ color: '#fbbf24' }} className="font-mono">5</span></div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--navy-900)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: '10%', backgroundColor: '#fbbf24' }} />
                    </div>
                  </div>
                  {/* Agent activity */}
                  <div className="text-xs mb-2" style={{ color: 'var(--navy-200)' }}>Recent Agent Activity</div>
                  <div className="space-y-1.5">
                    {[
                      { agent: 'Cerberus', action: 'ENG1 Medical Certificate — 7 days remaining', time: '2h ago', agentColor: 'var(--brass-500)', actionColor: 'var(--brass-500)' },
                      { agent: 'Cerberus', action: 'PSCRB expiring — renewal course recommended', time: '2h ago', agentColor: 'var(--brass-500)', actionColor: '#f87171' },
                      { agent: 'Nereus', action: 'Rotation scan complete — 0 conflicts', time: '6h ago', agentColor: 'var(--teal-500)', actionColor: 'var(--teal-500)' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: 'var(--navy-600)', color: item.agentColor }}>{item.agent}</span>
                        <span className="truncate" style={{ color: 'var(--navy-200)' }}>{item.action}</span>
                        <span className="ml-auto flex-shrink-0" style={{ color: 'var(--navy-200)', opacity: 0.5 }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-1 rounded-2xl blur-2xl -z-10" style={{ background: 'linear-gradient(to right, rgba(201,168,76,0.2), transparent, rgba(201,168,76,0.1))' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================== THE PAIN ============================== */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }} id="pain">
        {/* Split layout: left content, right captain image */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            {/* Left: pain content (3/5 width) */}
            <div className="lg:col-span-3">
              <div className="text-center lg:text-left mb-12 animate-fade-in">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
                  <ZapIcon className="w-4 h-4" />
                  <span className="text-xs tracking-[0.2em] uppercase font-medium">You Know This Feeling</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  It&apos;s 10pm. You&apos;re on rotation leave.<br />And you&apos;re checking a spreadsheet.
                </h2>
                <p className="text-lg max-w-2xl mx-auto lg:mx-0" style={{ color: 'var(--navy-200)' }}>
                  You were supposed to be off for two weeks. But Marco&apos;s PSCRB expires in 12 days.
                  Sarah&apos;s Schengen clock is ticking. The owner wants the monthly ops report by Friday.
                </p>
                <p className="text-sm mt-4 font-medium" style={{ color: 'var(--brass-500)' }}>
                  62% of captains work during their leave. You&apos;re not alone. But you shouldn&apos;t have to.
                  <span className="block mt-1 text-xs" style={{ color: 'var(--navy-200)', opacity: 0.5 }}>— Quay Group Captain Survey 2025/26, 367 captains</span>
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: <ZapIcon className="w-6 h-6" />,
                    title: 'The 2AM Thought',
                    quote: '"Did I miss a cert expiry? If port state control boards tomorrow..."',
                    result: 'Poseidon scans every 6 hours. You sleep.',
                    borderColor: 'rgba(248,113,113,0.15)',
                    hoverBorder: 'rgba(248,113,113,0.25)',
                  },
                  {
                    icon: <CertShieldIcon className="w-6 h-6" />,
                    title: 'The Inspection Dread',
                    quote: '"MLC audit in 3 days. I need every crew file, SEA, and cert. Two days of paperwork."',
                    result: 'One click. Findings + recommendations in seconds.',
                    borderColor: 'rgba(248,113,113,0.15)',
                    hoverBorder: 'rgba(248,113,113,0.25)',
                  },
                  {
                    icon: <MailIcon className="w-6 h-6" />,
                    title: 'The Inbox Abyss',
                    quote: '"Three crew contracts ending this quarter. Job posts, CV screening, interviews. Where do I start?"',
                    result: 'Mentor agent drafts JDs, screens CVs, schedules interviews.',
                    borderColor: 'rgba(248,113,113,0.15)',
                    hoverBorder: 'rgba(248,113,113,0.25)',
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="card animate-slide-up"
                    style={{
                      borderColor: card.borderColor,
                      backgroundColor: 'rgba(15,31,61,0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = card.hoverBorder; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = card.borderColor; }}
                  >
                    <div style={{ color: '#f87171' }} className="mb-3">{card.icon}</div>
                    <h3 className="text-sm font-semibold mb-2 tracking-wide" style={{ color: '#f87171' }}>{card.title}</h3>
                    <p className="italic text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>{card.quote}</p>
                    <div className="h-px mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--teal-500)' }}>{card.result}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Captain working late image (2/5 width) */}
            <div className="lg:col-span-2 hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative group rounded-2xl overflow-hidden" style={{ border: '2px solid var(--brass-500)' }}>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={IMAGES.captainWorking}
                    alt="Captain working late managing crew compliance and certifications"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ minHeight: '500px', maxHeight: '600px' }}
                  />
                </div>
                {/* Subtle gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent pointer-events-none" />
                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs" style={{ color: 'var(--navy-200)', opacity: 0.7 }}>
                    Photo by{' '}
                    <a href="https://unsplash.com/photos/1517457373958-b7bdd4587205" target="_blank" rel="noopener noreferrer" className="underline hover:text-brass-500 transition-colors">
                      Laurenz Kleinheider
                    </a>{' '}
                    on Unsplash
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== THE REVEAL / AGENTS ============================== */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
              <CompassIcon className="w-4 h-4" />
              <span className="text-xs tracking-[0.2em] uppercase font-medium">Imagine Instead</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              You wake up. You check your phone.<br />One notification.
            </h2>
            {/* Notification mockup */}
            <div className="card max-w-2xl mx-auto text-left !p-5" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-start gap-3">
                <AnchorIcon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brass-500)' }} />
                <div>
                  <div className="text-xs mb-1 font-mono" style={{ color: 'var(--navy-200)' }}>POSEIDON — 07:00 AEST</div>
                  <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-primary)', opacity: 0.9 }}>
                    &ldquo;Good morning, Captain. Cerberus scan complete. 0 expired certifications. 2 expiring in 60+ days &mdash; renewal courses available in Antibes for next month&apos;s crew change. Nereus confirms all rotations on schedule. Monthly owner report drafted and ready for review. Enjoy your leave.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {agents.slice(0, 3).map((agent, i) => (
              <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-3" style={{ color: agent.color }}>{agent.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{agent.name}</h3>
                  <span className="badge badge-info text-[10px] !px-2 !py-0.5">{agent.schedule}</span>
                </div>
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--brass-500)' }}>{agent.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--navy-200)' }}>{agent.desc}</p>
              </div>
            ))}
          </div>
          {/* Smaller agent cards */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {agents.slice(3).map((agent, i) => (
              <div key={i} className="card !p-4 flex items-start gap-3 animate-fade-in" style={{ backgroundColor: 'rgba(10,22,40,0.5)' }}>
                <div style={{ color: agent.color }} className="mt-0.5">{agent.icon}</div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{agent.name}</h4>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--navy-200)' }}>{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-8 italic" style={{ color: 'var(--brass-500)' }}>
            &ldquo;The AI doesn&apos;t replace your judgment. It replaces your remembering.&rdquo;
          </p>
        </div>
      </section>

      {/* ============================== THE RELIEF / TESTIMONIAL ============================== */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
              <QuoteIcon className="w-4 h-4" />
              <span className="text-xs tracking-[0.2em] uppercase font-medium">The Relief</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              What captains say after switching.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Happy captain image */}
            <div className="relative group animate-fade-in">
              <div className="relative overflow-hidden rounded-2xl" style={{ border: '2px solid var(--brass-500)' }}>
                <img
                  src={IMAGES.happyCaptain}
                  alt="Happy captain enjoying time off after Poseidon automated crew admin"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ minHeight: '420px', maxHeight: '520px' }}
                />
                {/* Glass overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs" style={{ color: 'var(--navy-200)', opacity: 0.7 }}>
                    Photo by{' '}
                    <a href="https://unsplash.com/photos/1476514525535-07fb3b4ae5f1" target="_blank" rel="noopener noreferrer" className="underline hover:text-brass-500 transition-colors">
                      Toa Heftiba
                    </a>{' '}
                    on Unsplash
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Testimonial */}
            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div
                className="card !p-8 relative backdrop-blur-xl"
                style={{
                  backgroundColor: 'rgba(15,31,61,0.4)',
                  borderColor: 'var(--border-glass)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="w-10 h-10 mb-4" style={{ color: 'var(--brass-500)', opacity: 0.3 }}>
                  <QuoteIcon className="w-full h-full" />
                </div>
                <blockquote className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  &ldquo;I used to spend my first three days back on leave catching up on certs, schedules, and owner reports.
                  Poseidon handles all of it. Now I actually get off the boat when we dock.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: 'var(--brass-500)', color: 'var(--text-on-brass)' }}
                  >
                    MC
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Marcus C.</div>
                    <div className="text-xs" style={{ color: 'var(--navy-200)' }}>Chief Officer, 68m motor yacht</div>
                  </div>
                </div>
                {/* Decorative brass border accent */}
                <div className="absolute top-0 left-8 right-8 h-0.5" style={{ backgroundColor: 'var(--brass-500)', opacity: 0.3 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== COMPARISON ============================== */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
              <ShipWheelIcon className="w-4 h-4" />
              <span className="text-xs tracking-[0.2em] uppercase font-medium">The Difference</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              What your spreadsheet can&apos;t do.
            </h2>
          </div>

          <div className="table-container max-w-4xl mx-auto shadow-card">
            <table className="poseidon-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th><CrossIcon className="w-3.5 h-3.5 inline-block mr-1" style={{ color: '#f87171' }} /> Without Poseidon</th>
                  <th><CheckIcon className="w-3.5 h-3.5 inline-block mr-1" style={{ color: 'var(--teal-500)' }} /> With Poseidon</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium text-sm">{row.scenario}</td>
                    <td>
                      <div className="flex items-start gap-2">
                        <CrossIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
                        <span style={{ color: 'var(--navy-200)' }}>{row.without}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-start gap-2">
                        <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--teal-500)' }} />
                        <span style={{ color: 'var(--text-primary)' }}>{row.with}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
              <QuoteIcon className="w-4 h-4" />
              <span className="text-xs tracking-[0.2em] uppercase font-medium">Honest Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Questions captains actually ask.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--brass-500)' }}>{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--navy-200)' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== PRICING ============================== */}
      <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--brass-500)' }}>
              <WalletIcon className="w-4 h-4" />
              <span className="text-xs tracking-[0.2em] uppercase font-medium">Investment</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Less than a deckhand.<br />More reliable than a purser.
            </h2>
            <p style={{ color: 'var(--navy-200)' }}>30-day free trial. No credit card. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`card relative animate-slide-up ${plan.highlight ? 'animate-pulse-glow' : ''}`}
                style={{
                  backgroundColor: plan.highlight ? 'var(--navy-700)' : 'var(--bg-card)',
                  borderColor: plan.highlight ? 'var(--border-strong)' : 'var(--border-glass)',
                  transform: plan.highlight ? 'scale(1.02)' : 'none',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full" style={{ backgroundColor: 'var(--brass-500)', color: 'var(--text-on-brass)' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.tier}</h3>
                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <span className="text-4xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>€{plan.price}</span>
                      <span style={{ color: 'var(--navy-200)' }}>/mo</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Custom</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  {[
                    `${plan.crew} crew`,
                    plan.agents,
                    plan.reports,
                    plan.support,
                    '1 vessel',
                  ].map((feat, j) => (
                    <li key={j} className="flex items-start gap-2" style={{ color: 'var(--navy-200)' }}>
                      <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brass-500)' }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${
                    plan.highlight ? 'brass-button' : 'brass-button-outline'
                  } !block text-center`}
                >
                  {plan.tier === 'Fleet' ? 'Book a Call' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--navy-200)', opacity: 0.5 }}>
            Annual billing saves 15%. Volume discount for management companies with 3+ vessels.
          </p>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Ocean horizon background with dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(3,10,30,0.7) 0%, rgba(3,10,30,0.85) 100%), url(${IMAGES.oceanHorizon})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />
        <div className="radial-glow absolute inset-0 opacity-30" />
        <div className="max-w-3xl mx-auto text-center relative animate-slide-up z-10">
          <h2 className="text-3xl sm:text-5xl font-bold mb-8 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            You didn&apos;t become a captain<br />
            <span className="text-gradient">to spend your leave doing paperwork.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--navy-200)' }}>
            Try Poseidon free for 30 days. If it doesn&apos;t save you 20 hours of admin in the first month,
            you don&apos;t pay.
          </p>
          <Link to="/signup" className="brass-button text-xl !px-12 !py-5 inline-block">
            Start Your Free Trial <ArrowRightIcon className="w-5 h-5 inline-block ml-2" />
          </Link>
          <p className="text-sm mt-6" style={{ color: 'var(--navy-200)', opacity: 0.5 }}>
            No credit card. Setup in 48 hours. Cancel anytime.<br />
            Built by people who know port from starboard.
          </p>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--border-glass)', backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--navy-200)', opacity: 0.5 }}>
            <AnchorIcon className="w-4 h-4" style={{ color: 'var(--brass-500)' }} />
            <span>Poseidon — Superyacht Crew AI</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs" style={{ color: 'var(--navy-200)', opacity: 0.5 }}>
            <span>Photos by{' '}
              <a href="https://www.pexels.com/photo/luxury-yacht-in-monaco-harbor-view-31383420/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brass-500 transition-colors">Raouf Meftah / Pexels</a>,{' '}
              <a href="https://unsplash.com/photos/1517457373958-b7bdd4587205" target="_blank" rel="noopener noreferrer" className="underline hover:text-brass-500 transition-colors">Laurenz Kleinheider</a>,{' '}
              <a href="https://unsplash.com/photos/1476514525535-07fb3b4ae5f1" target="_blank" rel="noopener noreferrer" className="underline hover:text-brass-500 transition-colors">Toa Heftiba</a>,{' '}
              <a href="https://unsplash.com/photos/1505228395891-9a51e7e86bf6" target="_blank" rel="noopener noreferrer" className="underline hover:text-brass-500 transition-colors">Jonatan Pie</a>
              {' '}on Unsplash &amp; Pexels
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs" style={{ color: 'var(--navy-200)', opacity: 0.35 }}>
          <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          <span>&copy; 2026 Poseidon Maritime Technologies</span>
        </div>
      </footer>
    </div>
  );
}
