import { useState, useEffect } from 'react';

interface OwnerData {
  revenue: {
    mrr: number;
    monthly: { skipper: number; captain: number };
    paidUsers: number;
    trialUsers: number;
    totalUsers: number;
  };
  operations: {
    vessels: number;
    crew: number;
    expiringCertsIn90d: number;
    openAlerts: number;
  };
  agents: {
    activity24h: number;
    errors24h: number;
    lastRun: { created_at: string; agent_name: string; action_type: string } | null;
    breakdown7d: { agent_name: string; count: number }[];
  };
  growth: {
    totalLeads: number;
    newLeads30d: number;
    contactedLeads: number;
    emailsSent: number;
    repliesReceived: number;
    activeAdCampaigns: number;
    telegramChats: number;
  };
  recentActivity: {
    created_at: string;
    agent_name: string;
    action_type: string;
    action_summary: string;
    status: string;
  }[];
  system: {
    dbSizeMB: number;
    newUsers30d: number;
  };
  usersByRole: { role: string; count: number }[];
}

export default function OwnerDashboard() {
  const [data, setData] = useState<OwnerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/owner/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('poseidon_token')}` },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setData(await res.json());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return <div className="text-red-400">Failed to load: {error}</div>;
  if (!data) return <div className="text-slate-400">No data available.</div>;

  const MetricCard = ({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color?: string; icon?: string }) => (
    <div className="bg-navy-800/50 border border-navy-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${color || 'text-white'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Owner Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Your business at a glance</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="px-3 py-1.5 text-xs bg-navy-700 border border-navy-500 text-slate-300 rounded hover:bg-navy-600 transition-colors flex items-center gap-1.5"
        >
          <span className={`inline-block ${refreshing ? 'animate-spin' : ''}`}>⟳</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Revenue Row */}
      <div>
        <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">💰 Revenue</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Monthly Recurring" value={`$${data.revenue.mrr.toLocaleString()}`} icon="📈" color="text-emerald-400" />
          <MetricCard label="Skipper ($499)" value={data.revenue.monthly.skipper} icon="⛵" />
          <MetricCard label="Captain ($799)" value={data.revenue.monthly.captain} icon="⚓" />
          <MetricCard label="Trial Users" value={data.revenue.trialUsers} icon="🎯" />
        </div>
      </div>

      {/* Operations Row */}
      <div>
        <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">⛵ Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Vessels" value={data.operations.vessels} icon="🚢" />
          <MetricCard label="Active Crew" value={data.operations.crew} icon="👥" />
          <MetricCard label="Expiring Certs (90d)" value={data.operations.expiringCertsIn90d} icon="📜" color={data.operations.expiringCertsIn90d > 10 ? 'text-orange-400' : 'text-white'} />
          <MetricCard label="Open Alerts" value={data.operations.openAlerts} icon="🔔" color={data.operations.openAlerts > 0 ? 'text-red-400' : 'text-emerald-400'} />
        </div>
      </div>

      {/* Agent Activity Row */}
      <div>
        <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">🤖 Agents</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Actions (24h)" value={data.agents.activity24h} icon="⚡" />
          <MetricCard label="Errors (24h)" value={data.agents.errors24h} icon="❌" color={data.agents.errors24h > 0 ? 'text-red-400' : 'text-emerald-400'} />
          <MetricCard label="Total Users" value={data.revenue.totalUsers} icon="👤" sub={`+${data.system.newUsers30d} new (30d)`} />
          <MetricCard label="DB Size" value={`${data.system.dbSizeMB} MB`} icon="💾" />
        </div>

        {/* Agent Breakdown */}
        {data.agents.breakdown7d.length > 0 && (
          <div className="mt-3 bg-navy-800/30 border border-navy-600 rounded-lg p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Agent Activity (7 days)</div>
            <div className="flex flex-wrap gap-2">
              {data.agents.breakdown7d.map(a => (
                <span key={a.agent_name} className="px-2.5 py-1 bg-navy-700 rounded text-xs text-slate-300 border border-navy-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 inline-block" />
                  {a.agent_name}
                  <span className="text-gold-400 font-semibold">{a.count}</span>
                </span>
              ))}
            </div>
            {data.agents.lastRun && (
              <div className="mt-2 text-xs text-slate-500">
                Last agent run: <span className="text-slate-300">{data.agents.lastRun.agent_name}</span> — {new Date(data.agents.lastRun.created_at).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Growth Row */}
      <div>
        <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">📈 Growth</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Leads" value={data.growth.totalLeads} sub={`+${data.growth.newLeads30d} new (30d)`} icon="📋" />
          <MetricCard label="Contacted" value={data.growth.contactedLeads} icon="📧" />
          <MetricCard label="Emails Sent" value={data.growth.emailsSent} icon="📨" />
          <MetricCard label="Replies" value={data.growth.repliesReceived} icon="💬" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <MetricCard label="Active Ad Campaigns" value={data.growth.activeAdCampaigns} icon="📢" />
          <MetricCard label="Telegram Chats" value={data.growth.telegramChats} icon="🤖" />
        </div>
      </div>

      {/* Two-column layout: Recent Activity + Users by Role */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="md:col-span-2 bg-navy-800/50 border border-navy-600 rounded-lg p-4">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Recent Agent Activity</h3>
          {data.recentActivity.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">No activity yet</div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {data.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b border-navy-700/50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gold-400">{a.agent_name}</span>
                      <span className="text-xs text-slate-400">{a.action_type}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{a.action_summary}</div>
                  </div>
                  <div className="text-xs text-slate-600 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users by Role */}
        <div className="bg-navy-800/50 border border-navy-600 rounded-lg p-4">
          <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Users by Role</h3>
          {data.usersByRole.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">No users</div>
          ) : (
            <div className="space-y-2">
              {data.usersByRole.map(u => (
                <div key={u.role} className="flex items-center justify-between py-1.5 border-b border-navy-700/50 last:border-0">
                  <span className="text-sm text-slate-300 capitalize">{u.role}</span>
                  <span className="text-sm font-semibold text-white">{u.count}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-navy-600">
                <span className="text-sm text-gold-400 font-semibold">Total</span>
                <span className="text-sm font-bold text-gold-400">{data.usersByRole.reduce((s, u) => s + u.count, 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
