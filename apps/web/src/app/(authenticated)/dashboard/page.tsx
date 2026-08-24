import { auth } from '@clerk/nextjs/server';
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, Database, Server } from "lucide-react";

export default async function Dashboard() {
  await auth.protect();

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-950 text-white font-sans">
      <header className="mb-8 border-b border-neutral-800 pb-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Dashboard</h1>
        <p className="text-sm text-neutral-500 font-bold tracking-widest uppercase mt-2">Overview of your security posture across all projects.</p>
      </header>

      {/* Main Health Status */}
      <div className="mb-8 p-4 rounded-xl bg-neutral-900 flex items-start gap-4">
        <div className="p-2 bg-violet-900/30 rounded-full text-violet-400 mt-1">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-black tracking-widest uppercase text-violet-400">System Healthy</h2>
          <p className="text-sm text-neutral-400 mt-1 font-medium leading-relaxed">
            Latest test runs completed successfully across all active targets. No new critical vulnerabilities detected in the last 24 hours.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <Activity className="h-4 w-4 text-violet-800" /> Tests Executed (30d)
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">1,204</div>
        </div>
        
        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <ShieldAlert className="h-4 w-4 text-violet-800" /> Unresolved Findings
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">4</div>
        </div>

        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <ShieldCheck className="h-4 w-4 text-violet-800" /> Resolved Findings
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">28</div>
        </div>

        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <TrendingUp className="h-4 w-4 text-violet-800" /> Verification Rate
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">98.5%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
            <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Test Runs</h3>
            </div>
            <div className="divide-y divide-neutral-800">
              {[
                { project: "Invoicing App", env: "Production", status: "Completed", time: "2 hours ago", findings: 0 },
                { project: "Customer Portal", env: "Staging", status: "Completed", time: "5 hours ago", findings: 2 },
                { project: "Admin Dashboard", env: "Development", status: "Failed", time: "1 day ago", findings: 0 },
              ].map((run, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-white">{run.project}</div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1 font-medium tracking-wide">
                      <span className="uppercase text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">{run.env}</span>
                      <span>&bull;</span>
                      <span>{run.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {run.findings > 0 ? (
                      <span className="text-[10px] font-black tracking-widest uppercase text-amber-500 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50">
                        {run.findings} Findings
                      </span>
                    ) : (
                      <span className="text-[10px] font-black tracking-widest uppercase text-violet-400 bg-violet-900/20 px-2 py-1 rounded border border-violet-800/50">
                        Clean
                      </span>
                    )}
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded border ${
                      run.status === 'Completed' 
                        ? 'text-neutral-300 bg-neutral-800 border-neutral-700' 
                        : 'text-red-400 bg-red-900/20 border-red-900/50'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-neutral-800 rounded-xl p-6 bg-neutral-900">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <Database className="h-4 w-4 text-violet-800" /> Security Baseline
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400 font-medium tracking-wide">Active Baseline</span>
                <span className="font-mono text-xs bg-neutral-800 px-2 py-1 rounded text-white font-bold">v1.4.2</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400 font-medium tracking-wide">App Model</span>
                <span className="font-mono text-xs bg-neutral-800 px-2 py-1 rounded text-white font-bold">am_8f92k</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                <span className="text-neutral-400 font-medium tracking-wide">Strategy</span>
                <span className="font-mono text-xs bg-neutral-800 px-2 py-1 rounded text-white font-bold">st_192ja</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-neutral-400 font-medium tracking-wide">Last Tested</span>
                <span className="text-white font-bold tracking-wide">Oct 24, 2026</span>
              </div>
            </div>
          </section>

          <section className="border border-neutral-800 rounded-xl p-6 bg-neutral-900">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <Server className="h-4 w-4 text-violet-800" /> Environment Health
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2 uppercase font-bold tracking-widest">
                  <span className="text-neutral-400">Production</span>
                  <span className="text-violet-400">Stable</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1">
                  <div className="bg-violet-800 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2 uppercase font-bold tracking-widest">
                  <span className="text-neutral-400">Staging</span>
                  <span className="text-amber-500">2 Findings</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1">
                  <div className="bg-amber-500 h-1 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

