import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function RotationPage() {
  const [vesselId, setVesselId] = useState('');
  const [rotations, setRotations] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCrewId, setEditCrewId] = useState<string | null>(null);
  const [form, setForm] = useState({ rotation_pattern: '3:1', days_on: 90, days_off: 30 });

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        const vid = res.vessels[0].id;
        setVesselId(vid);
        Promise.all([
          api.getRotations(vid),
          api.getCrew(vid)
        ]).then(([rotRes, crewRes]) => {
          setRotations(rotRes.rotations || []);
          setCrew(crewRes.crew || []);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleEdit = (crewId: string) => {
    const existing = rotations.find(r => r.crew_member_id === crewId);
    if (existing) {
      setForm({
        rotation_pattern: existing.rotation_pattern || '3:1',
        days_on: existing.days_on || 90,
        days_off: existing.days_off || 30
      });
    } else {
      setForm({ rotation_pattern: '3:1', days_on: 90, days_off: 30 });
    }
    setEditCrewId(crewId);
  };

  const handleSave = async () => {
    if (!editCrewId) return;
    await api.saveRotation(editCrewId, form);
    setEditCrewId(null);
    const res = await api.getRotations(vesselId);
    setRotations(res.rotations || []);
  };

  const crewWithoutRotation = crew.filter(c => !rotations.find(r => r.crew_member_id === c.id));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Rotation Management</h1>
          <p className="text-slate-400">{rotations.length} crew on rotation schedules</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editCrewId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditCrewId(null)}>
          <div className="bg-navy-800 border border-navy-600 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-4">Set Rotation Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pattern</label>
                <select value={form.rotation_pattern} onChange={e => setForm({ ...form, rotation_pattern: e.target.value })} className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="3:1">3:1 — 90 days on, 30 off</option>
                  <option value="2:2">2:2 — 60 days on, 60 off</option>
                  <option value="10:10">10:10 — 10 weeks on, 10 off</option>
                  <option value="6:3">6:3 — 6 weeks on, 3 off</option>
                  <option value="4:2">4:2 — 4 weeks on, 2 off</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Days On</label>
                  <input type="number" value={form.days_on} onChange={e => setForm({ ...form, days_on: parseInt(e.target.value) || 90 })}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Days Off</label>
                  <input type="number" value={form.days_off} onChange={e => setForm({ ...form, days_off: parseInt(e.target.value) || 30 })}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setEditCrewId(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rotation Table */}
      <div className="bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Crew</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Position</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Pattern</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Days On/Off</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Current Tour</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Next Start</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {rotations.map(r => (
                <tr key={r.id} className="border-b border-navy-700 hover:bg-navy-700/50">
                  <td className="px-4 py-3 text-sm text-white">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.position}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gold-400">{r.rotation_pattern}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.days_on}d / {r.days_off}d</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {r.current_tour_start ? `${r.current_tour_start} → ${r.current_tour_end || '?'}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{r.next_tour_start || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(r.crew_member_id)} className="text-xs px-2 py-1 bg-navy-700 text-slate-400 rounded hover:text-white transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rotations.length === 0 && <div className="p-8 text-center text-slate-500">No rotations configured.</div>}
      </div>

      {/* Crew Without Rotation */}
      {crewWithoutRotation.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">Crew without rotation schedule</h2>
          <div className="flex gap-2 flex-wrap">
            {crewWithoutRotation.map(c => (
              <button key={c.id} onClick={() => handleEdit(c.id)}
                className="px-3 py-1.5 bg-navy-800 border border-navy-600 rounded-lg text-sm text-slate-300 hover:border-gold-500/30 hover:text-gold-400 transition-colors">
                {c.first_name} {c.last_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
