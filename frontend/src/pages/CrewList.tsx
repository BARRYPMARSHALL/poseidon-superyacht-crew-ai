import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function CrewList() {
  const [crew, setCrew] = useState<any[]>([]);
  const [vesselId, setVesselId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api.vessels().then(res => {
      if (res.vessels?.length > 0) {
        setVesselId(res.vessels[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!vesselId) return;
    api.getCrew(vesselId).then(res => setCrew(res.crew)).finally(() => setLoading(false));
  }, [vesselId]);

  const filtered = deptFilter === 'all' ? crew : crew.filter(c => c.department === deptFilter);

  const departments = ['all', ...new Set(crew.map(c => c.department).filter(Boolean))];

  const handleAddCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));
    await api.addCrew(vesselId, data);
    setShowAdd(false);
    const res = await api.getCrew(vesselId);
    setCrew(res.crew);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Crew Manifest</h1>
          <p className="text-slate-400">{crew.filter(c => c.status === 'active').length} active crew members</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm">
          {showAdd ? 'Cancel' : '+ Add Crew'}
        </button>
      </div>

      {/* Add Crew Form */}
      {showAdd && (
        <div className="bg-navy-800 rounded-xl border border-navy-600 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Crew Member</h2>
          <form onSubmit={handleAddCrew} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="first_name" placeholder="First Name *" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" required />
            <input name="last_name" placeholder="Last Name *" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" required />
            <input name="position" placeholder="Position *" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" required />
            <select name="department" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400">
              <option value="">Select Department</option>
              <option value="deck">Deck</option>
              <option value="engineering">Engineering</option>
              <option value="interior">Interior</option>
              <option value="galley">Galley</option>
              <option value="management">Management</option>
              <option value="medical">Medical</option>
            </select>
            <input name="nationality" placeholder="Nationality" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" />
            <input name="email" placeholder="Email" type="email" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" />
            <input name="join_date" placeholder="Join Date (YYYY-MM-DD)" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" />
            <input name="salary" placeholder="Salary" type="number" className="bg-navy-900 border border-navy-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400" />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-2 transition-colors text-sm">Add to Manifest</button>
          </form>
        </div>
      )}

      {/* Department Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {departments.map(d => (
          <button
            key={d}
            onClick={() => setDeptFilter(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
              deptFilter === d ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-navy-800 text-slate-400 border border-navy-600 hover:text-white'
            }`}
          >
            {d === 'all' ? 'All Departments' : d}
          </button>
        ))}
      </div>

      {/* Crew Table */}
      <div className="bg-navy-800 rounded-xl border border-navy-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600 text-left">
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Name</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Position</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Department</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Nationality</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Join Date</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Contract End</th>
                <th className="px-4 py-3 text-xs text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-b border-navy-700 hover:bg-navy-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/crew/${member.id}`} className="text-white hover:text-gold-400 font-medium text-sm">
                      {member.first_name} {member.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">{member.position}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="capitalize px-2 py-0.5 bg-navy-700 rounded text-xs text-slate-300">{member.department || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{member.nationality || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{member.join_date || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {member.contract_end_date ? (
                      <span className={new Date(member.contract_end_date) < new Date(Date.now() + 60*24*60*60*1000) ? 'text-amber-400' : 'text-slate-400'}>
                        {member.contract_end_date}
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      member.status === 'on_leave' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{member.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">No crew members found.</div>
        )}
      </div>
    </div>
  );
}
