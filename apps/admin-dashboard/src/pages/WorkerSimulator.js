import React from 'react';

const WorkerSimulator = () => {
    const [subTab, setSubTab] = React.useState('home');
    const [payoutAlert, setPayoutAlert] = React.useState(false);
    const [reporting, setReporting] = React.useState(false);

    const simulatePayout = () => {
        setPayoutAlert(true);
        setTimeout(() => setPayoutAlert(false), 5000);
    };

    return (
      <div className="flex flex-col items-center justify-center p-8 mt-10">
        <div className="relative w-[340px] h-[680px] bg-[#0f0f17] rounded-[3rem] border-[8px] border-slate-800 shadow-[0_0_100px_rgba(79,70,229,0.1)] overflow-hidden">
          
          {/* Payout Notification Overlay */}
          {payoutAlert && (
            <div className="absolute top-12 left-4 right-4 bg-emerald-500 rounded-2xl p-4 z-[100] shadow-2xl animate-in slide-in-from-top-10 duration-500">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    💰
                  </div>
                  <div>
                    <p className="text-white text-[10px] font-black uppercase">Payout Received</p>
                    <p className="text-white font-bold text-sm">₹450.00 Credited</p>
                  </div>
               </div>
            </div>
          )}

          {/* Incident Modal Overlay */}
          {reporting && (
            <div className="absolute inset-0 bg-black/90 z-[90] p-8 flex flex-col justify-center animate-in fade-in zoom-in-95">
               <h3 className="text-2xl font-black mb-2 text-white">Report Incident</h3>
               <p className="text-slate-400 text-xs mb-8">Are you currently experiencing an income disruption (Rain, AQI, Curfew)?</p>
               
               <div className="space-y-3">
                  <button onClick={() => { setReporting(false); simulatePayout(); }} className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold">YES, TRIGGER CLAIM</button>
                  <button onClick={() => setReporting(false)} className="w-full py-4 bg-white/5 text-slate-400 rounded-xl font-bold">CANCEL</button>
               </div>
            </div>
          )}

          {/* Phone Notch/Status Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50"></div>
          <div className="absolute top-2 right-6 flex gap-1 z-50">
            <div className="w-1 h-2.5 bg-slate-400 rounded-sm"></div>
            <div className="w-1 h-2.5 bg-slate-400 rounded-sm"></div>
            <div className="w-1 h-2.5 bg-indigo-500 rounded-sm"></div>
          </div>

          {/* App Content */}
          <div className="h-full bg-[#050508] p-6 pt-12 pb-24 overflow-y-auto no-scrollbar selection:bg-indigo-500/20">
            
            {subTab === 'home' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Header Greeting */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Namaste, Ramesh</p>
                    <h2 className="text-2xl font-black text-white">Mumbai West</h2>
                  </div>
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                    <span className="text-indigo-400 text-sm font-black">RK</span>
                  </div>
                </div>

                {/* Coverage Status Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-2xl shadow-lg border border-white/10 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                      <span className="text-white text-[10px] font-black uppercase tracking-wider">Policy Active</span>
                  </div>
                  <p className="text-indigo-100 text-xs leading-relaxed">You are protected against income loss until Sunday, 11:59 PM.</p>
                </div>

                {/* GigScore Meter Mock */}
                <div className="bg-[#11111a] p-6 rounded-2xl border border-white/5 text-center mb-6">
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-4">Current GigScore</p>
                  <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#222" strokeWidth="8" />
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="351" strokeDashoffset="45" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">850</span>
                        <span className="text-emerald-400 text-[10px] font-bold">PLATINUM</span>
                      </div>
                  </div>
                  <p className="text-slate-400 text-[10px]">Top 5% of all Swiggy Workers.</p>
                </div>

                {/* Emergency Support Button */}
                <button 
                  onClick={() => setReporting(true)}
                  className="w-full mt-4 py-4 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-[10px] font-black tracking-widest transition-all">
                  REPORT AN INCIDENT
                </button>
              </div>
            )}

            {subTab === 'corpus' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-2xl font-black text-white mb-6">GigCorpus</h2>
                <div className="bg-[#11111a] p-6 rounded-2xl border border-white/5 mb-6">
                   <p className="text-slate-500 text-[10px] uppercase font-black mb-2">Total Accumulated</p>
                   <p className="text-4xl font-black text-indigo-400">₹8,450.20</p>
                   <p className="text-emerald-400 text-[10px] font-bold mt-2">✨ Compounding at 7.2% p.a.</p>
                </div>
                <div className="space-y-4">
                   {[
                     { l: 'Premiums Contributed', v: '₹4,200' },
                     { l: 'Yield Earned', v: '₹4,310' },
                     { l: 'Claim Drawdown', v: '₹60' },
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs text-slate-400">{item.l}</span>
                        <span className="text-xs font-bold text-white">{item.v}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Dock Navigation */}
          <div className="absolute bottom-6 left-8 right-8 h-16 bg-[#1a1a25]/90 backdrop-blur-md rounded-2xl border border-white/10 flex justify-around items-center z-[80]">
              <button 
                onClick={() => setSubTab('home')}
                className={`p-2 transition-transform ${subTab === 'home' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              </button>
              <button 
                onClick={() => setSubTab('corpus')}
                className={`p-2 transition-transform ${subTab === 'corpus' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}>
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3c4.86-2.36 8-6.04 8-11.5C20 5.81 16.19 2 11.5 2zm1 14.5h-2v-2h2v2zm0-3.5h-2v-5h2v5z"/></svg>
              </button>
          </div>

        </div>
      </div>
    );
};

export default WorkerSimulator;
