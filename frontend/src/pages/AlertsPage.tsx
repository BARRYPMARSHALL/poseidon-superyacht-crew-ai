import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [, setVesselId] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        const vid = res.vessels[0].id;
        setVesselId(vid);
        api.getAlerts(vid).then(res => {
          setAlerts(res.alerts || []);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleResolve = async (alertId: string) => {
    await api.resolveAlert(alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: 1 } : a));
  };

  const handleMarkRead = async (alertId: string) => {
    await api.markRead(alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: 1 } : a));
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
  const active = filtered.filter(a => !a.is_resolved);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  const severityIcon = (s: string) => s === 'critical' ? '🔴' : s === 'warning' ? '🟡' : '🔵';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Center</h1>
          <p className="text-slate-400">{active.length} unresolved alerts</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'critical', 'warning', 'info'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            filter === f ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-navy-800 text-slate-400 border border-navy-600'
          }`}>{f}</button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map(alert => (
          <div key={alert.id} className={`p-4 rounded-xl border transition-colors ${
            alert.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' :
            alert.severity === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
            'border-navy-600 bg-navy-800'
          } ${alert.is_resolved ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-lg mt-0.5">{severityIcon(alert.severity)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{alert.severity}</span>
                    <span className="text-xs text-slate-500">{alert.alert_type}</span>
                    {alert.is_resolved && <span className="text-xs text-emerald-400">✅ Resolved</span>}
                  </div>
                  <h3 className="text-white font-medium">{alert.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                  <div className="text-xs text-slate-600 mt-2">{new Date(alert.created_at).toLocaleString()}</div>
                </div>
              </div>
              {!alert.is_resolved && (
                <div className="flex gap-1 ml-3">
                  {!alert.is_read && (
                    <button onClick={() => handleMarkRead(alert.id)} className="text-xs px-2 py-1 bg-navy-700 text-slate-400 rounded hover:text-white transition-colors">
                      Read
                    </button>
                  )}
                  <button onClick={() => handleResolve(alert.id)} className="text-xs px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 border border-emerald-600/30 transition-colors">
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 p-8">No alerts to display. All clear! 🎉</div>
        )}
      </div>
    </div>
  );
}
