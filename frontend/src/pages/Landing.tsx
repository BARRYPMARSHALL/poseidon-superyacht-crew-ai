import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-[#f0ede5] font-sans overflow-x-hidden">
      {/* ======================================== NAV ======================================== */}
      <nav className="fixed top-0 w-full z-50 bg-[#060d1a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚓</span>
            <span className="text-[#c9a84c] font-bold text-lg tracking-tight">Poseidon</span>
            <span className="text-[#8b9bb4] text-sm hidden sm:inline">Superyacht Crew AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[#8b9bb4] hover:text-[#f0ede5] text-sm transition-colors">Sign In</Link>
            <Link to="/signup" className="bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a] font-semibold px-5 py-2 rounded-lg text-sm transition-colors">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* ======================================== HERO ======================================== */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Subtle chart-line background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(201,168,76,0.3) 40px, rgba(201,168,76,0.3) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(201,168,76,0.3) 40px, rgba(201,168,76,0.3) 41px)`
        }} />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <div className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-4 font-medium">
                ⚓ For Superyacht Captains & Fleet Managers
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
                Your Crew.<br/>
                Your Compliance.<br/>
                Your Peace of Mind.<br/>
                <span className="text-[#c9a84c]">Handled.</span>
              </h1>
              <p className="text-lg text-[#8b9bb4] mb-8 max-w-xl leading-relaxed">
                Poseidon is an AI chief officer that tracks every STCW certificate, MLC requirement, 
                visa expiry, and crew rotation — so you stop doing admin at 10pm and start 
                getting your leave back.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a] font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] text-center">
                  Start Free Trial →
                </Link>
                <a href="#how-it-works" className="border border-[#c9a84c]/30 hover:border-[#c9a84c] text-[#c9a84c] px-8 py-4 rounded-xl text-lg transition-colors text-center">
                  See How It Works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-[#8b9bb4]">
                <span>✓ 30-day free trial</span>
                <span>✓ No credit card</span>
                <span>✓ Setup in 48 hours</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>

            {/* Right: Bridge visual */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Simulated dashboard on a dark screen */}
                <div className="bg-[#0a1628] p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                    <span className="ml-3 text-xs text-[#8b9bb4] font-mono">poseidon — bridge overview</span>
                  </div>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#0f1f3d] rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-[#8b9bb4]">Active Crew</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400">16</div>
                    </div>
                    <div className="bg-[#0f1f3d] rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-[#8b9bb4]">Cert Health</div>
                      <div className="text-2xl font-bold font-mono text-amber-400">78%</div>
                    </div>
                    <div className="bg-[#0f1f3d] rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-[#8b9bb4]">Expiring ≤30d</div>
                      <div className="text-2xl font-bold font-mono text-red-400">5</div>
                    </div>
                    <div className="bg-[#0f1f3d] rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-[#8b9bb4]">Open Alerts</div>
                      <div className="text-2xl font-bold font-mono text-amber-400">4</div>
                    </div>
                  </div>
                  {/* Cert timeline */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs"><span className="text-[#8b9bb4]">Expired Certs</span><span className="text-red-400 font-mono">10</span></div>
                    <div className="h-1.5 bg-[#060d1a] rounded-full"><div className="h-1.5 bg-red-500 rounded-full" style={{width:'20%'}} /></div>
                    <div className="flex justify-between text-xs"><span className="text-[#8b9bb4]">Expiring ≤30d</span><span className="text-amber-400 font-mono">5</span></div>
                    <div className="h-1.5 bg-[#060d1a] rounded-full"><div className="h-1.5 bg-amber-500 rounded-full" style={{width:'10%'}} /></div>
                  </div>
                  {/* Recent activity */}
                  <div className="text-xs text-[#8b9bb4] mb-2">Recent Agent Activity</div>
                  <div className="space-y-1.5">
                    {[
                      { agent: 'Cerberus', action: 'ENG1 Medical Certificate — 7 days remaining', time: '2h ago', color: 'text-amber-400' },
                      { agent: 'Cerberus', action: 'PSCRB expiring — renewal course recommended', time: '2h ago', color: 'text-red-400' },
                      { agent: 'Nereus', action: 'Rotation scan complete — 0 conflicts', time: '6h ago', color: 'text-emerald-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="bg-[#152952] px-1.5 py-0.5 rounded text-[#c9a84c] font-mono text-[10px]">{item.agent}</span>
                        <span className="text-[#8b9bb4] truncate">{item.action}</span>
                        <span className="text-[#8b9bb4]/50 ml-auto flex-shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#c9a84c]/20 via-transparent to-[#c9a84c]/10 rounded-2xl blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== THE PAIN ======================================== */}
      <section className="py-24 px-6 bg-[#0a1628]" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-4 font-medium">You Know This Feeling</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              It's 10pm. You're on rotation leave.<br/>And you're checking a spreadsheet.
            </h2>
            <p className="text-[#8b9bb4] text-lg max-w-2xl mx-auto">
              You were supposed to be off for two weeks. But Marco's PSCRB expires in 12 days. 
              Sarah's Schengen clock is ticking. The owner wants the monthly ops report by Friday.
            </p>
            <p className="text-[#c9a84c] text-sm mt-4 font-medium">
              62% of captains work during their leave. You're not alone. But you shouldn't have to.
              <span className="text-[#8b9bb4]/50 text-xs block mt-1">— Quay Group Captain Survey 2025/26, 367 captains</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'The 2AM Thought', quote: '"Did I miss a cert expiry? If port state control boards tomorrow..."', result: 'Poseidon scans every 6 hours. You sleep.' },
              { icon: '🛑', title: 'The Inspection Dread', quote: '"MLC audit in 3 days. I need every crew file, SEA, and cert. Two days of paperwork."', result: 'One click. Findings + recommendations in seconds.' },
              { icon: '📧', title: 'The Inbox Abyss', quote: '"Three crew contracts ending this quarter. Job posts, CV screening, interviews. Where do I start?"', result: 'Mentor agent drafts JDs, screens CVs, schedules interviews.' },
            ].map((card, i) => (
              <div key={i} className="bg-[#0f1f3d]/50 backdrop-blur border border-red-500/10 rounded-xl p-6 hover:border-red-500/20 transition-colors">
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="text-[#e05555] text-sm font-semibold mb-2 tracking-wide">{card.title}</h3>
                <p className="text-[#f0ede5]/80 italic text-sm mb-4 leading-relaxed">{card.quote}</p>
                <div className="h-px bg-white/5 mb-4" />
                <p className="text-[#4ade80] text-xs font-medium">{card.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== THE REVEAL ======================================== */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-4 font-medium">Imagine Instead</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-6" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              You wake up. You check your phone.<br/>One notification.
            </h2>
            <div className="bg-[#0a1628] border border-[#c9a84c]/10 rounded-xl p-6 max-w-2xl mx-auto text-left">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚓</span>
                <div>
                  <div className="text-xs text-[#8b9bb4] mb-1 font-mono">POSEIDON — 07:00 AEST</div>
                  <p className="text-[#f0ede5]/90 text-sm leading-relaxed italic">
                    "Good morning, Captain. Cerberus scan complete. 0 expired certifications. 2 expiring in 60+ days — renewal courses available in Antibes for next month's crew change. Nereus confirms all rotations on schedule. Monthly owner report drafted and ready for review. Enjoy your leave."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '🐕', name: 'Cerberus', role: 'Certification & Compliance', desc: 'Scans every cert, passport, and visa every 6 hours. Alerts at 90, 60, 30, 14, 7, and 1 days. Knows STCW dependencies. Books renewal training. Generates MLC 2006 audits.', schedule: 'Every 6 hours' },
              { icon: '🌊', name: 'Nereus', role: 'Rotation & Scheduling', desc: 'Tracks crew rotations. Monitors Schengen 90/180 day rule. Flags returning crew with expiring certs. Optimizes handovers. No more "I thought you had that covered."', schedule: 'Daily' },
              { icon: '📨', name: 'Hermes', role: 'Reporting & Comms', desc: 'Generates monthly owner reports. Creates onboarding checklists. Manages offboarding. Drafts job posts when crew resign. Screens CVs. Prepares port clearance docs.', schedule: 'On demand' },
            ].map((agent, i) => (
              <div key={i} className="bg-[#0a1628] border border-white/5 rounded-xl p-6 hover:border-[#c9a84c]/20 transition-all">
                <div className="text-3xl mb-3">{agent.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-[#152952] rounded text-[#8b9bb4] font-mono">{agent.schedule}</span>
                </div>
                <p className="text-[#c9a84c] text-sm font-medium mb-3">{agent.role}</p>
                <p className="text-[#8b9bb4] text-sm leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>

          {/* Smaller agents */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {[
              { icon: '💰', name: 'Plutus', desc: 'Multi-currency payroll, SEA templates, owner budget vs. actual reporting.' },
              { icon: '🎓', name: 'Mentor', desc: 'Career development tracking, retention risk scoring, training recommendations.' },
            ].map((agent, i) => (
              <div key={i} className="bg-[#0a1628]/50 border border-white/5 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xl">{agent.icon}</span>
                <div>
                  <h4 className="text-white font-semibold text-sm">{agent.name}</h4>
                  <p className="text-[#8b9bb4] text-xs leading-relaxed mt-1">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[#c9a84c] text-sm mt-8 italic">
            "The AI doesn't replace your judgment. It replaces your remembering."
          </p>
        </div>
      </section>

      {/* ======================================== COMPARISON ======================================== */}
      <section className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-4 font-medium">The Difference</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              What your spreadsheet can't do.
            </h2>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {[
              { scenario: 'Cert about to expire', without: 'You remember. Maybe.', with: 'Cerberus alerted you 90 days ago. Reminded you yesterday.' },
              { scenario: 'MLC inspection tomorrow', without: '2 days of frantic paperwork. Hope nothing is missing.', with: 'One click. Findings + recommendations. Audit-ready.' },
              { scenario: 'Crew member resigns', without: 'Weekend writing a job post. Screening CVs manually.', with: 'Mentor drafts the JD, screens applicants, schedules interviews.' },
              { scenario: 'Owner wants monthly report', without: 'Sunday evening at your laptop.', with: 'Hermes drafted it. You review and send. 5 minutes.' },
              { scenario: 'Schengen days running low', without: 'Crew member tells you when it\'s too late.', with: 'Nereus alerts at 20 days. Rotation adjusted. No overstay.' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-3 items-center bg-[#0f1f3d]/30 rounded-xl p-4 border border-white/5">
                <div className="text-[#f0ede5] font-medium text-sm md:text-center">{row.scenario}</div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-sm">
                  <span className="text-red-400/70 text-xs uppercase tracking-wider">Without Poseidon</span>
                  <p className="text-[#8b9bb4] mt-1">{row.without}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-sm">
                  <span className="text-emerald-400/70 text-xs uppercase tracking-wider">With Poseidon</span>
                  <p className="text-[#8b9bb4] mt-1">{row.with}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== OBJECTIONS ======================================== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-4 font-medium">Honest Answers</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              Questions captains actually ask.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'I already have YachtWyse / a spreadsheet. Why switch?', a: 'Those tools store your data. Poseidon acts on it. Your spreadsheet won\'t tell you Marco\'s PSCRB expires in 7 days. Poseidon will — and it\'ll suggest where to renew it based on where the vessel is.' },
              { q: 'Is my crew\'s data secure?', a: 'Encrypted at rest. Your data stays on your instance. We never access it, share it, or train on it. You control it.' },
              { q: 'What if I have unreliable internet at sea?', a: 'Poseidon works as a Progressive Web App with offline mode. Syncs when you\'re back in range. The agents run on our servers, so alerts still fire even when you\'re offline.' },
              { q: 'I\'m not technical. Can I use this?', a: 'If you can use WhatsApp and email, you can use Poseidon. We built it with captains. Plus: we\'ll onboard your crew data for you.' },
              { q: 'How long does setup take?', a: 'Send us your crew spreadsheet. We\'ll have you live within 48 hours. Most captains are fully operational in under 2 hours of their own time.' },
              { q: 'What if it makes a mistake?', a: 'Poseidon drafts. You approve. It never auto-submits to authorities. It never books a course without your confirmation. You\'re still in command.' },
            ].map((faq, i) => (
              <div key={i} className="bg-[#0a1628] border border-white/5 rounded-xl p-5">
                <h3 className="text-[#c9a84c] font-semibold text-sm mb-2">{faq.q}</h3>
                <p className="text-[#8b9bb4] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================== PRICING ======================================== */}
      <section className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[#c9a84c] text-xs tracking-[0.2em] uppercase mb-4 font-medium">Investment</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
              Less than a deckhand.<br/>More reliable than a purser.
            </h2>
            <p className="text-[#8b9bb4]">30-day free trial. No credit card. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tier: 'Skipper', price: 499, crew: 'Up to 15', agents: 'Cerberus + Nereus', reports: 'Basic alerts', support: 'Email', highlight: false },
              { tier: 'Captain', price: 799, crew: 'Up to 30', agents: 'All 5 agents', reports: 'Full compliance + owner', support: 'Priority email', highlight: true },
              { tier: 'Fleet', price: null, crew: 'Unlimited', agents: 'All + white-label', reports: 'Fleet analytics', support: 'Dedicated + SLA', highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-xl p-8 border transition-all relative ${
                plan.highlight
                  ? 'bg-[#0f1f3d] border-[#c9a84c]/30 shadow-[0_0_40px_rgba(201,168,76,0.1)] scale-[1.02]'
                  : 'bg-[#0a1628] border-white/5 hover:border-white/10'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c9a84c] text-[#060d1a] text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-1">{plan.tier}</h3>
                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <span className="text-4xl font-bold text-white font-mono">€{plan.price}</span>
                      <span className="text-[#8b9bb4]">/mo</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-white">Custom</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2 text-[#8b9bb4]"><span className="text-[#c9a84c] mt-0.5">•</span> {plan.crew} crew</li>
                  <li className="flex items-start gap-2 text-[#8b9bb4]"><span className="text-[#c9a84c] mt-0.5">•</span> {plan.agents}</li>
                  <li className="flex items-start gap-2 text-[#8b9bb4]"><span className="text-[#c9a84c] mt-0.5">•</span> {plan.reports}</li>
                  <li className="flex items-start gap-2 text-[#8b9bb4]"><span className="text-[#c9a84c] mt-0.5">•</span> {plan.support}</li>
                  <li className="flex items-start gap-2 text-[#8b9bb4]"><span className="text-[#c9a84c] mt-0.5">•</span> 1 vessel</li>
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-lg font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a]'
                      : 'border border-[#c9a84c]/30 text-[#c9a84c] hover:border-[#c9a84c]'
                  }`}
                >
                  {plan.tier === 'Fleet' ? 'Book a Call' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[#8b9bb4]/50 text-xs mt-6">
            Annual billing saves 15%. Volume discount for management companies with 3+ vessels.
          </p>
        </div>
      </section>

      {/* ======================================== THE CLOSE ======================================== */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(201,168,76,0.5) 0%, transparent 70%)`
        }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-8 leading-tight" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>
            You didn't become a captain<br/>
            <span className="text-[#c9a84c]">to spend your leave doing paperwork.</span>
          </h2>
          <p className="text-[#8b9bb4] text-lg mb-10">
            Try Poseidon free for 30 days. If it doesn't save you 20 hours of admin in the first month, 
            you don't pay.
          </p>
          <Link to="/signup" className="inline-block bg-[#c9a84c] hover:bg-[#d4b85e] text-[#060d1a] font-bold px-12 py-5 rounded-xl text-xl transition-all hover:shadow-[0_0_40px_rgba(201,168,76,0.3)]">
            Start Your Free Trial →
          </Link>
          <p className="text-[#8b9bb4]/50 text-sm mt-6">
            No credit card. Setup in 48 hours. Cancel anytime.<br/>
            Built by people who know port from starboard.
          </p>
        </div>
      </section>

      {/* ======================================== FOOTER ======================================== */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#060d1a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#8b9bb4]/50 text-sm">
            <span>⚓</span>
            <span>Poseidon — Superyacht Crew AI</span>
          </div>
          <div className="flex gap-6 text-sm text-[#8b9bb4]/50">
            <a href="#" className="hover:text-[#8b9bb4] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#8b9bb4] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#8b9bb4] transition-colors">Contact</a>
            <span>© 2026 Poseidon Maritime Technologies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
