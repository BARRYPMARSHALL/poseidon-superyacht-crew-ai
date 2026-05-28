import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const POSITIONS = ['Captain', 'Chief Officer', 'Second Officer', 'Bosun', 'Deckhand', 'Lead Deckhand', 'Chief Engineer', 'Second Engineer', 'ETO', 'Chief Stewardess', 'Second Stewardess', 'Stewardess', 'Head Chef', 'Sous Chef'];
const DEPARTMENTS = ['deck', 'engineering', 'interior', 'galley', 'management'];

export default function RecruitmentPage() {
  const [vesselId, setVesselId] = useState('');
  const [crew, setCrew] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'dev'>('jobs');

  // Job Description
  const [jdPosition, setJdPosition] = useState('Captain');
  const [jdDept, setJdDept] = useState('management');
  const [jdResult, setJdResult] = useState<any>(null);

  // Development Plan
  const [selectedCrew, setSelectedCrew] = useState('');
  const [devPlan, setDevPlan] = useState<any>(null);

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        const vid = res.vessels[0].id;
        setVesselId(vid);
        api.getCrew(vid).then(r => setCrew(r.crew || []));
      }
    });
  }, []);

  const handleGenerateJD = async () => {
    const result = await api.draftJobDescription(vesselId, jdPosition, jdDept);
    setJdResult(result);
  };

  const handleDevPlan = async (crewId: string) => {
    setSelectedCrew(crewId);
    const plan = await api.getDevelopmentPlan(crewId);
    setDevPlan(plan);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Recruitment & Development</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('jobs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-navy-800 text-slate-400 border border-navy-600'}`}>📋 Job Descriptions</button>
        <button onClick={() => setActiveTab('dev')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dev' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-navy-800 text-slate-400 border border-navy-600'}`}>📈 Development Plans</button>
      </div>

      {activeTab === 'jobs' && (
        <div>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Draft Job Description</h2>
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Position</label>
                <select value={jdPosition} onChange={e => setJdPosition(e.target.value)} className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm">
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Department</label>
                <select value={jdDept} onChange={e => setJdDept(e.target.value)} className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm capitalize">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <button onClick={handleGenerateJD} className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">Generate</button>
            </div>
          </div>

          {jdResult && (
            <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">{jdResult.position} — {jdResult.vessel}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs text-slate-400 uppercase mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {jdResult.requirements?.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span>{r}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 uppercase mb-2">Responsibilities</h4>
                  <ul className="space-y-1">
                    {jdResult.responsibilities?.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-navy-600">
                <span className="text-sm text-gold-400 font-semibold">Salary Range: €{jdResult.salary_range?.min?.toLocaleString()} – €{jdResult.salary_range?.max?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dev' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crew List */}
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-white mb-3">Crew</h2>
            <div className="space-y-1">
              {crew.map(c => (
                <button key={c.id} onClick={() => handleDevPlan(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCrew === c.id ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-slate-300 hover:bg-navy-700'}`}>
                  {c.first_name} {c.last_name}
                  <span className="block text-xs text-slate-500">{c.position}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Development Plan */}
          <div className="lg:col-span-2">
            {devPlan ? (
              <div className="bg-navy-800 border border-navy-600 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-1">{devPlan.crew_member}</h3>
                <p className="text-sm text-slate-400 mb-4">{devPlan.current_position} 
                  {devPlan.next_role ? <span className="text-gold-400"> → {devPlan.next_role}</span> : ' — No clear next role'}
                </p>

                {devPlan.career_path?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs text-slate-400 uppercase mb-2">Career Path</h4>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      {devPlan.career_path.map((step: string, i: number) => (
                        <span key={i} className="text-slate-300">
                          {i > 0 && <span className="text-slate-600 mx-1">→</span>}
                          <span className={step === devPlan.next_role ? 'text-gold-400 font-semibold' : ''}>{step}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {devPlan.expiring_certs?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs text-amber-400 uppercase mb-2">⚠️ Expiring Certifications</h4>
                    <div className="space-y-1">
                      {devPlan.expiring_certs.map((c: any, i: number) => (
                        <div key={i} className="text-sm text-slate-300 flex justify-between">
                          <span>{c.cert}</span>
                          <span className="text-amber-400">{c.expires}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {devPlan.missing_certs_for_promotion?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs text-red-400 uppercase mb-2">Missing Certifications for Promotion</h4>
                    <div className="flex gap-2 flex-wrap">
                      {devPlan.missing_certs_for_promotion.map((c: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-xs text-slate-400 uppercase mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {devPlan.recommendations?.map((r: string, i: number) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-emerald-400 mt-0.5">💡</span>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-navy-800 border border-navy-600 rounded-xl p-8 text-center text-slate-500">
                Select a crew member to view their development plan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
