import React from 'react';
import FraudQueue from './pages/FraudQueue';
import FundStats from './pages/FundStats';
import WorkerSimulator from './pages/WorkerSimulator';

const AdminLayout = () => {
  const [activeTab, setActiveTab] = React.useState('operations');
  const [showToast, setShowToast] = React.useState(null);

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl shadow-emerald-500/20 z-[100] animate-bounce">
          {showToast}
        </div>
      )}

      {/* Premium Sidebar/Navigation */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-[#0f0f17]/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer" onClick={() => setActiveTab('operations')}>
            <span className="text-white font-black text-xl">G</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            GigShield <span className="text-indigo-400">Core</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('operations')}
            className={`text-sm font-medium transition-colors ${activeTab === 'operations' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Operations
          </button>
          <button 
            onClick={() => setActiveTab('worker')}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border border-indigo-500/20 transition-all ${activeTab === 'worker' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Worker App
          </button>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            Analytics
          </button>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 group cursor-pointer hover:border-indigo-500/50 transition-all">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-400">Live Triggers Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pt-28 pb-20 px-8 max-w-[1440px] mx-auto">
        
        {activeTab === 'operations' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero KPI Section */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Protected Workers', value: '1,248', desc: '+12% from last week', color: 'indigo' },
                { label: 'Claim Reserve (AUM)', value: '₹12.4 Cr', desc: '45.2% Coverage Ratio', color: 'blue' },
                { label: 'Avg GigScore', value: '642', desc: 'Target: 700+', color: 'emerald' },
                { label: 'Risk Incident Index', value: '0.04', desc: 'Nominal Range', color: 'rose' },
              ].map((kpi, i) => (
                <div key={i} className="group relative bg-[#0f0f17] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className="text-3xl font-black mb-2">{kpi.value}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    {kpi.desc}
                  </p>
                </div>
              ))}
            </section>

            {/* Dynamic Visualization Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FundStats />
              </div>
              <div className="space-y-8">
                <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Live Response Center
                    </h2>
                    <div className="space-y-4">
                      {[
                        { time: '2m ago', event: 'Rain Trigger > 65mm', zone: 'Andheri East', status: 'Processing' },
                        { time: '14m ago', event: 'AQI Surge > 405', zone: 'Gurgaon Sec-44', status: 'Settled' },
                        { time: '1h ago', event: 'Curfew Alert', zone: 'Pune Central', status: 'Active' },
                      ].map((log, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border-l-2 border-indigo-500/50">
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">{log.time}</span>
                            <div>
                              <p className="text-sm font-bold">{log.event}</p>
                              <p className="text-xs text-slate-400">{log.zone} • {log.status}</p>
                            </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Fraud Queue Integration */}
            <div className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div>
                  <h2 className="text-xl font-bold">Investigation Hub</h2>
                  <p className="text-xs text-slate-500">Flags requiring human oversight from the 5-layer fraud engine</p>
                </div>
                <button 
                  onClick={() => triggerToast('Queue Refreshed')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-all"
                >
                  Refresh Feed
                </button>
              </div>
              <FraudQueue onAction={(msg) => triggerToast(msg)} />
            </div>
          </div>
        )}

        {activeTab === 'worker' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
             <WorkerSimulator />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-20 text-center space-y-4 animate-in fade-in zoom-in-95">
            <h2 className="text-4xl font-black">Analytics Module</h2>
            <p className="text-slate-400">Deep-dive parametric yield models coming soon.</p>
          </div>
        )}

        {activeTab === 'risk' && (
           <div className="p-20 text-center space-y-4 animate-in fade-in zoom-in-95">
             <h2 className="text-4xl font-black text-rose-500">Risk Engine HUD</h2>
             <p className="text-slate-400">Real-time GNN node analysis is currently being simulated.</p>
           </div>
        )}

      </main>

      {/* Futuristic footer */}
      <footer className="py-10 border-t border-white/5 flex flex-col items-center gap-2 opacity-50">
        <p className="text-xs font-mono tracking-tighter">© 2026 GIGSHIELD CORE V2.4 // NODE-AI-DISTRIBUTED</p>
      </footer>
    </div>
  );
};

export default AdminLayout;
