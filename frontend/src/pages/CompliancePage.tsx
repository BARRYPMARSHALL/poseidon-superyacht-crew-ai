import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function CompliancePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [vesselId, setVesselId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        const vid = res.vessels[0].id;
        setVesselId(vid);
        api.getReports(vid).then(res => {
          setReports(res.reports || []);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleGenerate = async (reportType: string) => {
    setGenerating(true);
    setGeneratedReport(null);
    try {
      const report = await api.generateReport(vesselId, reportType);
      setGeneratedReport(report);
      const updated = await api.getReports(vesselId);
      setReports(updated.reports || []);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Center</h1>
          <p className="text-slate-400">{reports.length} reports generated</p>
        </div>
      </div>

      {/* Generate Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleGenerate('mlc_2006')}
          disabled={generating}
          className="bg-navy-800 border border-navy-600 rounded-xl p-5 text-left hover:border-gold-500/30 transition-colors disabled:opacity-50"
        >
          <div className="text-2xl mb-2">📋</div>
          <h3 className="text-white font-semibold">MLC 2006 Audit</h3>
          <p className="text-sm text-slate-400 mt-1">Full Maritime Labour Convention compliance check</p>
        </button>

        <button
          onClick={() => handleGenerate('stcw_audit')}
          disabled={generating}
          className="bg-navy-800 border border-navy-600 rounded-xl p-5 text-left hover:border-gold-500/30 transition-colors disabled:opacity-50"
        >
          <div className="text-2xl mb-2">📜</div>
          <h3 className="text-white font-semibold">STCW Audit</h3>
          <p className="text-sm text-slate-400 mt-1">Standards of Training & Certification compliance</p>
        </button>

        <button
          onClick={() => handleGenerate('port_state_prep')}
          disabled={generating}
          className="bg-navy-800 border border-navy-600 rounded-xl p-5 text-left hover:border-gold-500/30 transition-colors disabled:opacity-50"
        >
          <div className="text-2xl mb-2">⚓</div>
          <h3 className="text-white font-semibold">Port State Prep</h3>
          <p className="text-sm text-slate-400 mt-1">Pre-inspection readiness report</p>
        </button>
      </div>

      {generating && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-navy-800 rounded-xl border border-navy-600">
          <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gold-400">Generating report...</span>
        </div>
      )}

      {/* Generated Report */}
      {generatedReport && (
        <div className="bg-navy-800 rounded-xl border border-gold-500/30 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gold-400">
              {generatedReport.report_type?.toUpperCase()} Report — {generatedReport.report_date}
            </h2>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">Draft</span>
          </div>
          <div className="bg-navy-900 rounded-lg p-4 border border-navy-600">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Findings</h3>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{generatedReport.findings}</pre>
          </div>
          {generatedReport.recommendations && (
            <div className="bg-navy-900 rounded-lg p-4 border border-navy-600 mt-4">
              <h3 className="text-sm font-semibold text-gold-400 mb-3">AI Recommendations</h3>
              <pre className="text-sm text-gold-300/80 whitespace-pre-wrap font-sans">{generatedReport.recommendations}</pre>
            </div>
          )}
        </div>
      )}

      {/* Past Reports */}
      {reports.length > 0 && (
        <div className="bg-navy-800 rounded-xl border border-navy-600 overflow-hidden">
          <div className="p-4 border-b border-navy-600">
            <h2 className="text-lg font-semibold text-white">📁 Report History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-600 text-left">
                  <th className="px-4 py-3 text-xs text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs text-slate-400 uppercase">Findings</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-b border-navy-700 hover:bg-navy-700/50">
                    <td className="px-4 py-3 text-sm text-white uppercase">{r.report_type}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{r.report_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        r.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' :
                        r.status === 'final' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 max-w-md truncate">{r.findings?.substring(0, 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
