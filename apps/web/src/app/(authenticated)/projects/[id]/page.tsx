import { auth } from '@clerk/nextjs/server';
import { Activity, Database } from "lucide-react";

export default async function ProjectOverview() {
  await auth.protect();
  
  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</div>
          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Active Monitoring
          </div>
        </div>
        
        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Test Run</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">2 hours ago</div>
        </div>

        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Findings</div>
          <div className="text-sm font-medium text-rose-600 dark:text-rose-400">3 Issues</div>
        </div>

        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Environments</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Prod, Staging</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden">
          <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" /> Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-white/10">
            <div className="p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-gray-100">Test Run Completed</span>
                <span className="text-gray-500">2h ago</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Run ID: <span className="font-mono text-xs">tr_893jd2</span> on Production. Found 1 new issue.</p>
            </div>
            <div className="p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-gray-100">Application Model Updated</span>
                <span className="text-gray-500">5h ago</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Discovered 2 new API endpoints during exploratory phase.</p>
            </div>
            <div className="p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-gray-100">Finding Resolved</span>
                <span className="text-gray-500">1d ago</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Issue <span className="font-mono text-xs">fnd_9x28</span> verified as resolved in Staging.</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-500" /> Current Baseline
              </h2>
            </div>
            <div className="p-4 space-y-3 bg-white dark:bg-[#0a0a0a]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Version</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">v1.4.2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Known Endpoints</span>
                <span className="text-gray-900 dark:text-gray-100">142</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Authorized Roles</span>
                <span className="text-gray-900 dark:text-gray-100">3</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-white/10 rounded p-5 bg-gray-50 dark:bg-[#0f0f0f] flex flex-col justify-center h-32">
             <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Need to test a new deployment?</h3>
             <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Trigger an exploratory run to map changes and generate new adversarial tests.</p>
             <button className="self-start text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
               Start New Run
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}

