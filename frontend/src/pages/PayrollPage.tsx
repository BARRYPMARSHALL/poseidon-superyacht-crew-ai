import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function PayrollPage() {
  const [vesselId, setVesselId] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      api.getPayroll(vesselId),
      api.getBudgetReport(vesselId)
    ]).then(([payRes, budRes]) => {
      setRecords(payRes.records || []);
      setBudget(budRes);
      setLoading(false);
    });
  }, [vesselId]);

  const handleProcessPayroll = async () => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const end = now.toISOString().split('T')[0];
    await api.processPayroll(vesselId, start, end);
    const res = await api.getPayroll(vesselId);
    setRecords(res.records || []);
  };

  const handlePay = async (recordId: string) => {
    await api.payRecord(recordId);
    const res = await api.getPayroll(vesselId);
    setRecords(res.records || []);
  };

  const totalPending = records.filter(r => r.status === 'pending').reduce((s, r) => s + r.net_pay, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance & Payroll</h1>
          <p className="text-slate-400">{records.length} records</p>
        </div>
        <button onClick={handleProcessPayroll} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          💰 Run Payroll
        </button>
      </div>

      {/* Budget Overview */}
      {budget && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase">Active Crew</div>
            <div className="text-2xl font-bold text-white mt-1">{budget.crew_count}</div>
          </div>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase">Monthly Payroll</div>
            <div className="text-2xl font-bold text-gold-400 mt-1">€{budget.monthly_payroll?.total?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase">Pending Pay</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">€{totalPending.toLocaleString()}</div>
          </div>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase">Est. Annual</div>
            <div className="text-2xl font-bold text-white mt-1">€{budget.estimated_annual_crew_cost?.toLocaleString() || 0}</div>
          </div>
        </div>
      )}

      {/* Department Breakdown */}
      {budget?.monthly_payroll?.by_department && (
        <div className="bg-navy-800 border border-navy-600 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Department Breakdown</h2>
          <div className="space-y-3">
            {budget.monthly_payroll.by_department.map((dept: any) => {
              const pct = (dept.total_salary / budget.monthly_payroll.total * 100).toFixed(0);
              return (
                <div key={dept.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white capitalize">{dept.department}</span>
                    <span className="text-slate-400">{dept.crew} crew · €{dept.total_salary.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payroll Records */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Crew</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Position</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Period</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Base</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Net</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-navy-700 hover:bg-navy-700/50">
                  <td className="px-4 py-3 text-sm text-white">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.position}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.period_start} → {r.period_end}</td>
                  <td className="px-4 py-3 text-sm text-white">€{r.base_salary?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gold-400">€{r.net_pay?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' && (
                      <button onClick={() => handlePay(r.id)} className="text-xs px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-colors">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && <div className="p-8 text-center text-slate-500">Run payroll to see records here.</div>}
      </div>
    </div>
  );
}
