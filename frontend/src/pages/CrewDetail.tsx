import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function CrewDetail() {
  const { crewId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [visas, setVisas] = useState<any[]>([]);
  const [rotation, setRotation] = useState<any>(null);
  const [sea, setSea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [renewalPlan, setRenewalPlan] = useState<any>(null);
  const [onboarding, setOnboarding] = useState<any>(null);
  const [vesselId, setVesselId] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        const vid = res.vessels[0].id;
        setVesselId(vid);
        if (crewId) {
          api.getCrewMember(vid, crewId).then(data => {
            setMember(data.member);
            setCerts(data.certifications || []);
            setVisas(data.visas || []);
            setRotation(data.rotation);
            setSea(data.sea_agreement);
            setLoading(false);
          });
          api.getRenewalPlan(crewId).then(setRenewalPlan);
          api.getOnboarding(crewId).then(setOnboarding);
        }
      }
    });
  }, [crewId]);

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    await api.addCert(crewId!, data);
    setShowAddCert(false);
    const updated = await api.getCerts(crewId!);
    setCerts(updated.certifications);
  };

  const handleOffboard = async () => {
    if (!confirm('Offboard this crew member?')) return;
    await api.offboardCrew(vesselId, crewId!);
    navigate('/crew');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!member) return <div className="text-slate-400">Crew member not found.</div>;

  return (
    <div>
      <button onClick={() => navigate('/crew')} className="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm">← Back to Manifest</button>

      {/* Header */}
      <div className="bg-navy-800 rounded-xl border border-navy-600 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center text-2xl font-bold text-gold-400">
              {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{member.first_name} {member.last_name}</h1>
              <p className="text-gold-400 font-medium">{member.position}</p>
              <p className="text-slate-400 text-sm">{member.department} • {member.nationality}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
              'bg-red-500/10 text-red-400'
            }`}>{member.status}</span>
            {member.status === 'active' && (
              <button onClick={handleOffboard} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 border border-red-500/20 transition-colors">
                Offboard
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <div><span className="text-slate-500">Email</span><p className="text-white">{member.email || '—'}</p></div>
          <div><span className="text-slate-500">Joined</span><p className="text-white">{member.join_date || '—'}</p></div>
          <div><span className="text-slate-500">Contract End</span><p className={new Date(member.contract_end_date) < new Date(Date.now() + 60*24*60*60*1000) ? 'text-amber-400' : 'text-white'}>{member.contract_end_date || '—'}</p></div>
          <div><span className="text-slate-500">Salary</span><p className="text-white">{member.salary ? `${member.salary_currency || 'EUR'} ${member.salary?.toLocaleString()}/mo` : '—'}</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
          <div><span className="text-slate-500">Passport</span><p className="text-white">{member.passport_number || '—'} {member.passport_expiry ? `(exp: ${member.passport_expiry})` : ''}</p></div>
          <div><span className="text-slate-500">Rotation</span><p className="text-white">{rotation?.rotation_pattern || '—'}</p></div>
          <div><span className="text-slate-500">SEA Status</span><p className={sea ? 'text-emerald-400' : 'text-red-400'}>{sea ? 'Active' : 'No active SEA'}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certifications */}
        <div className="bg-navy-800 rounded-xl border border-navy-600 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">📜 Certifications ({certs.length})</h2>
            <button onClick={() => setShowAddCert(!showAddCert)} className="text-xs bg-gold-500/20 text-gold-400 px-3 py-1 rounded-lg hover:bg-gold-500/30 border border-gold-500/20">
              + Add Cert
            </button>
          </div>

          {showAddCert && (
            <form onSubmit={handleAddCert} className="grid grid-cols-2 gap-3 mb-4 bg-navy-900 rounded-lg p-4">
              <input name="cert_type" placeholder="Cert Type (e.g. STCW_BST)" className="bg-navy-800 border border-navy-600 rounded px-3 py-1.5 text-white text-sm" required />
              <input name="cert_name" placeholder="Cert Name" className="bg-navy-800 border border-navy-600 rounded px-3 py-1.5 text-white text-sm" required />
              <input name="issuing_authority" placeholder="Issuing Authority" className="bg-navy-800 border border-navy-600 rounded px-3 py-1.5 text-white text-sm" required />
              <input name="issue_date" type="date" placeholder="Issue Date" className="bg-navy-800 border border-navy-600 rounded px-3 py-1.5 text-white text-sm" required />
              <input name="expiry_date" type="date" placeholder="Expiry Date" className="bg-navy-800 border border-navy-600 rounded px-3 py-1.5 text-white text-sm" required />
              <button type="submit" className="bg-emerald-600 text-white text-sm rounded px-3 py-1.5 hover:bg-emerald-500">Save</button>
            </form>
          )}

          <div className="space-y-2">
            {certs.map((cert: any) => {
              const now = new Date();
              const exp = new Date(cert.expiry_date);
              const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={cert.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  daysLeft < 0 ? 'border-red-500/30 bg-red-500/5' :
                  daysLeft <= 30 ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-navy-600 bg-navy-900'
                }`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{cert.cert_name}</div>
                    <div className="text-xs text-slate-400">{cert.issuing_authority} • {cert.cert_type}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className={`text-sm font-semibold ${
                      daysLeft < 0 ? 'text-red-400' : daysLeft <= 30 ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      {daysLeft < 0 ? `EXPIRED ${Math.abs(daysLeft)}d ago` : `${daysLeft}d left`}
                    </div>
                    <div className="text-xs text-slate-500">Exp: {cert.expiry_date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Renewal Plan + Onboarding */}
        <div className="space-y-6">
          {renewalPlan && renewalPlan.expiring_certs?.length > 0 && (
            <div className="bg-navy-800 rounded-xl border border-navy-600 p-5">
              <h2 className="text-lg font-semibold text-white mb-3">🔄 AI Renewal Plan</h2>
              <p className="text-sm text-slate-400 mb-3">{renewalPlan.message || `${renewalPlan.expiring_certs.length} certs expiring within 90 days.`}</p>
              {renewalPlan.renewal_groups?.map((g: any, i: number) => (
                <div key={i} className="mb-3 bg-navy-900 rounded-lg p-3 border border-navy-600">
                  <div className="text-xs text-gold-400 font-medium mb-1">Group {i + 1}</div>
                  <div className="text-sm text-white">{g.certs.join(', ')}</div>
                  <div className="text-xs text-slate-500 mt-1">{g.reason}</div>
                </div>
              ))}
              {renewalPlan.recommended_providers?.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-slate-400 mb-2">Recommended Training Providers:</div>
                  {renewalPlan.recommended_providers.slice(0, 3).map((p: any) => (
                    <div key={p.name} className="text-xs text-slate-300 flex justify-between py-1">
                      <span>{p.name} ({p.location})</span>
                      <span className="text-gold-400">{'⭐'.repeat(Math.round(p.rating))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {onboarding && (
            <div className="bg-navy-800 rounded-xl border border-navy-600 p-5">
              <h2 className="text-lg font-semibold text-white mb-3">📋 Onboarding Checklist</h2>
              <div className="text-xs text-slate-400 mb-2">
                {onboarding.completed}/{onboarding.total} completed
              </div>
              <div className="w-full bg-navy-900 rounded-full h-2 mb-3">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(onboarding.completed / onboarding.total) * 100}%` }} />
              </div>
              <div className="space-y-1">
                {onboarding.onboarding_checklist?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span>{item.status === 'complete' ? '✅' : '⬜'}</span>
                    <span className={item.status === 'complete' ? 'text-slate-500 line-through' : 'text-slate-300'}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visas */}
          {visas.length > 0 && (
            <div className="bg-navy-800 rounded-xl border border-navy-600 p-5">
              <h2 className="text-lg font-semibold text-white mb-3">🛂 Visas</h2>
              {visas.map((v: any) => (
                <div key={v.id} className="flex justify-between text-sm py-1.5 border-b border-navy-700 last:border-0">
                  <span className="text-slate-300">{v.visa_type} ({v.issuing_country})</span>
                  <span className={new Date(v.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-amber-400' : 'text-slate-400'}>
                    Exp: {v.expiry_date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
