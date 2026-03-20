import React from 'react';
import { getNAVData } from '../shared/mockDataProvider';

const FundStats = () => {
  const data = getNAVData();

  return (
    <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-8 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">Resource Liquidity & Claim Burn</h2>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AUM Growth</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claim Payouts</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* NAV Chart */}
          <div>
            <div className="h-64 flex items-end justify-between gap-2 border-b border-white/5 pb-4">
              {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group/bar">
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-indigo-600 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        NAV: {d.nav}
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-md shadow-lg shadow-indigo-500/20 group-hover/bar:brightness-125 transition-all" 
                      style={{ height: `${(d.nav / 150) * 180}px` }}
                    ></div>
                  </div>
                  <span className="text-[10px] mt-4 text-slate-500 font-bold uppercase">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Claims Chart */}
          <div>
            <div className="h-64 flex items-end justify-between gap-2 border-b border-white/5 pb-4">
              {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group/bar">
                  <div className="relative w-full flex flex-col items-center">
                    <div className="absolute bottom-full mb-2 bg-rose-600 text-[10px] text-white px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Claims: {d.claims}k
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-md shadow-lg shadow-rose-500/20 group-hover/bar:brightness-125 transition-all" 
                      style={{ height: `${(d.claims / 150) * 180}px` }}
                    ></div>
                  </div>
                  <span className="text-[10px] mt-4 text-slate-500 font-bold uppercase">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-white/5">
           <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yield Stability</p>
                <p className="text-xl font-bold">98.4% Confidence</p>
              </div>
           </div>
           <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payout Latency (Avg)</p>
                <p className="text-xl font-bold">14.2 Minutes</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FundStats;
