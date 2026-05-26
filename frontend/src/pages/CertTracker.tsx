import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function CertTracker() {
  const [expiringCerts, setExpiringCerts] = useState<any[]>([]);
  const [vesselId, setVesselId] = useState('');
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(90);

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        const vid = res.vessels[0].id;
        setVesselId(vid);
        loadCerts(vid, daysFilter);
      }
    });
  }, []);

  const loadCerts = (vid: string, days: number) => {
    setLoading(true);
    api.getExpiringCerts(vid, days).then(res => {
      setExpiringCerts(res.expiring_certs || []);
      setLoading(false);
    });
  };

  const handleFilter = (days: number) => {
    setDaysFilter(days);
    loadCerts(vesselId, days);
  };

  const handleRunScan = async () => {
    await api.runCerberus();
    loadCerts(vesselId, daysFilter);
  };

  const handleGenerateReport = async () => {
    await api.generateReport(vesselId, 'stcw_audit');
    alert('STCW audit report generated. Check Compliance page.');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  // Group by severity
  const expired = expiringCerts.filter(c => new Date(c.expiry_date) < new Date());
  const critical = expiringCerts.filter(c => {
    const d = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000*60*60*24));
    return d >= 0 && d <= 30;
  });
  const warning = expiringCerts.filter(c => {
    const d = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000*60*60*24));
    return d > 30 && d <= 90;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Certification Tracker</h1>
          <p className="text-slate-400">{expiringCerts.length} certifications expiring within {daysFilter} days</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRunScan} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            🤖 Run Cerberus Scan
          </button>
          <button onClick={handleGenerateReport} className="bg-gold-500 hover:bg-gold-400 text-navy-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            📄 Generate STCW Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{expired.length}</div>
          <div className="text-sm text-red-300/70">Expired</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-amber-400">{critical.length}</div>
          <div className="text-sm text-amber-300/70">Critical (≤30 days)</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-400">{warning.length}</div>
          <div className="text-sm text-blue-300/70">Warning (31-90 days)</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[30, 60, 90, 180].map(d => (
          <button key={d} onClick={() => handleFilter(d)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            daysFilter === d ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-navy-800 text-slate-400 border border-navy-600'
          }`}>{d} days</button>
        ))}
      </div>

      {/* Cert Table */}
      <div className="bg-navy-800 rounded-xl border border-navy-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Crew</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Position</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Certification</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Authority</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Expiry</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {expiringCerts.map((cert: any) => {
                const daysLeft = Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000*60*60*24));
                return (
                  <tr key={cert.id} className="border-b border-navy-700 hover:bg-navy-700/50">
                    <td className="px-4 py-3 text-sm text-white">{cert.first_name} {cert.last_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{cert.position}</td>
                    <td className="px-4 py-3 text-sm text-white">{cert.cert_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{cert.cert_type}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{cert.issuing_authority}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{cert.expiry_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        daysLeft < 0 ? 'bg-red-500/10 text-red-400' :
                        daysLeft <= 30 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {daysLeft < 0 ? `EXPIRED ${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expiringCerts.length === 0 && (
          <div className="p-8 text-center text-slate-500">No certifications expiring within {daysFilter} days. 🎉</div>
        )}
      </div>
    </div>
  );
}
