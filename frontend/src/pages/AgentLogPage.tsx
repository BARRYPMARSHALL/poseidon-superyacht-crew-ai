import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AgentLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [vesselId, setVesselId] = useState('');
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('all');

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        setVesselId(res.vessels[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!vesselId) return;
    Promise.all([
      api.getAgentLogs(vesselId, agentFilter, 50),
      api.getAgentStats(vesselId)
    ]).then(([logRes, statRes]) => {
      setLogs(logRes.logs || []);
      setStats(statRes.stats || []);
      setLoading(false);
    });
  }, [vesselId, agentFilter]);

  const agents = ['all', ...new Set(stats.map(s => s.agent_name))];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Activity Log</h1>
          <p className="text-slate-400">{logs.length} recent actions</p>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.agent_name} className="bg-navy-800 border border-navy-600 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.count}</div>
            <div className="text-xs text-slate-400 mt-1">{s.agent_name}</div>
            <div className="text-[10px] text-slate-600">{s.last_run?.slice(0, 10) || '—'}</div>
          </div>
        ))}
      </div>

      {/* Agent Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {agents.map(a => (
          <button key={a} onClick={() => setAgentFilter(a)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
              agentFilter === a ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-navy-800 text-slate-400 border border-navy-600'
            }`}>{a === 'all' ? 'All Agents' : a}</button>
        ))}
      </div>

      {/* Log Entries */}
      <div className="space-y-2">
        {logs.map((log: any) => (
          <div key={log.id} className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold">{log.agent_name}</span>
              <span className="text-xs text-slate-500">{log.action_type}</span>
              <span className="text-xs text-slate-600 ml-auto">{log.created_at}</span>
            </div>
            <p className="text-sm text-white">{log.action_summary}</p>
            {log.details && log.details !== '{}' && (
              <details className="mt-2">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300">Details</summary>
                <pre className="text-[10px] text-slate-500 mt-1 bg-navy-900 rounded p-2 overflow-x-auto">{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>
              </details>
            )}
          </div>
        ))}
        {logs.length === 0 && <div className="text-center text-slate-500 p-8">No agent activity recorded yet. Run a scan to see results here.</div>}
      </div>
    </div>
  );
}
