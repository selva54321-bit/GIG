import React from 'react';

const FraudQueue = ({ onAction }) => {
    const [claims, setClaims] = React.useState([
      { id: 'CL-001', user: 'Ramesh K.', score: 82, zone: 'Mumbai_Andheri', trigger: 'RAIN', platform: 'Zepto' },
      { id: 'CL-004', user: 'Suresh V.', score: 45, zone: 'Delhi_NCR', trigger: 'AQI', platform: 'Swiggy' },
      { id: 'CL-005', user: 'Amit S.', score: 68, zone: 'Chennai_Tnagar', trigger: 'FLOOD', platform: 'Zomato' },
    ]);
  
    const handleAction = (id, type) => {
        setClaims(prev => prev.filter(c => c.id !== id));
        onAction(`Claim ${id} ${type === 'approve' ? 'Approved' : 'Rejected'}`);
    };
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-8 py-4">Status</th>
              <th className="px-6 py-4">Claim ID</th>
              <th className="px-6 py-4">Worker</th>
              <th className="px-6 py-4">Risk %</th>
              <th className="px-6 py-4 border-r border-white/5">Zone</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-4">
                  <div className={`w-2 h-2 rounded-full ${claim.score > 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}></div>
                </td>
                <td className="px-6 py-4 font-mono text-slate-400">{claim.id}</td>
                <td className="px-6 py-4 font-semibold text-white">
                  {claim.user}
                  <span className="block text-[10px] text-slate-500 uppercase">{claim.platform}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${claim.score > 80 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${claim.score}%` }}></div>
                    </div>
                    <span className="text-xs font-bold">{claim.score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 border-r border-white/5">{claim.zone}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => handleAction(claim.id, 'review')}
                        className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-500/20 transition-all font-mono">INVESTIGATE</button>
                    <button 
                        onClick={() => handleAction(claim.id, 'approve')}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all font-mono">APPROVE</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

export default FraudQueue;
