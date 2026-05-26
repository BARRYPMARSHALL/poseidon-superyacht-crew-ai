import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface DashboardData {
  vessel: any;
  crew: any;
  certifications: any;
  visas_expiring_90_days: number;
  passports_expiring_90_days: number;
  alerts: any;
  contracts_ending_60_days: any[];
  recent_activity: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vesselId, setVesselId] = useState<string>('');

  useEffect(() => {
    // Get first vessel
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        setVesselId(res.vessels[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!vesselId) return;
    api.dashboard(vesselId).then(setData).finally(() => setLoading(false));
  }, [vesselId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-slate-400">No vessel data found.</div>;

  const { vessel, crew, certifications, alerts } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bridge Overview</h1>
          <p className="text-slate-400">
            {vessel.name} • {vessel.length}m • {vessel.flag} Flag
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            vessel.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
          }`}>
            {vessel.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Crew" value={crew.total} sub={`${crew.on_leave} on leave`} color="text-blue-400" icon="👥" />
        <StatCard label="Expired Certs" value={certifications.expired} sub="Requires immediate action" color={certifications.expired > 0 ? 'text-red-400' : 'text-emerald-400'} icon="📜" />
        <StatCard label="Expiring ≤30 Days" value={certifications.expiring_30_days} sub="Critical window" color={certifications.expiring_30_days > 0 ? 'text-amber-400' : 'text-emerald-400'} icon="⚠️" />
        <StatCard label="Unresolved Alerts" value={alerts.critical + alerts.warnings} sub={`${alerts.critical} critical`} color={alerts.critical > 0 ? 'text-red-400' : 'text-slate-400'} icon="🔔" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Certifications */}
        <div className="lg:col-span-2 bg-navy-800 rounded-xl border border-navy-600 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">⏳ Certifications Timeline</h2>
          <div className="space-y-3">
            <CertBar label="Expired" count={certifications.expired} total={crew.total * 5} color="bg-red-500" />
            <CertBar label="Expiring ≤30 days" count={certifications.expiring_30_days} total={crew.total * 5} color="bg-amber-500" />
            <CertBar label="Expiring 30-90 days" count={certifications.expiring_90_days} total={crew.total * 5} color="bg-blue-500" />
          </div>
          <div className="mt-4 text-sm text-slate-400">
            Plus {data.passports_expiring_90_days} passports and {data.visas_expiring_90_days} visas expiring within 90 days.
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-navy-800 rounded-xl border border-navy-600 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Crew Breakdown</h2>
          <div className="space-y-2">
            {(crew.by_department || []).map((dept: any) => (
              <div key={dept.department} className="flex justify-between text-sm">
                <span className="text-slate-400 capitalize">{dept.department || 'Unassigned'}</span>
                <span className="text-white font-medium">{dept.count}</span>
              </div>
            ))}
          </div>
          <hr className="border-navy-600 my-4" />
          <h3 className="text-sm font-semibold text-slate-300 mb-2">📋 Contracts Ending (60 days)</h3>
          {data.contracts_ending_60_days?.length > 0 ? (
            <div className="space-y-1">
              {data.contracts_ending_60_days.map((c: any) => (
                <div key={c.id} className="text-xs text-slate-400 flex justify-between">
                  <span>{c.first_name} {c.last_name} ({c.position})</span>
                  <span className="text-amber-400">{c.contract_end_date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No contracts ending soon.</p>
          )}
        </div>
      </div>

      {/* Recent Agent Activity */}
      <div className="mt-6 bg-navy-800 rounded-xl border border-navy-600 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">🤖 Recent Agent Activity</h2>
        {data.recent_activity?.length > 0 ? (
          <div className="space-y-2">
            {data.recent_activity.slice(0, 10).map((act: any) => (
              <div key={act.id} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 text-xs w-32 flex-shrink-0">
                  {new Date(act.created_at).toLocaleString()}
                </span>
                <span className="px-2 py-0.5 bg-navy-700 rounded text-xs text-gold-400 flex-shrink-0">{act.agent_name}</span>
                <span className="text-slate-300 truncate">{act.action_summary}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                  act.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                  act.status === 'pending_approval' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>{act.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No agent activity yet. Run a scan to see results.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: number; sub: string; color: string; icon: string }) {
  return (
    <div className="bg-navy-800 rounded-xl border border-navy-600 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function CertBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={count > 0 ? 'text-white font-medium' : 'text-slate-500'}>{count}</span>
      </div>
      <div className="w-full bg-navy-900 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
