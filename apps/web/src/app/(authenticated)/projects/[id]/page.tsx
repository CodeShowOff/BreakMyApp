import { auth } from '@clerk/nextjs/server';
import { Activity, Database } from "lucide-react";
import { getProject, getFindings, getTestRuns } from "@/lib/api";

export default async function ProjectOverview({ params }: { params: { id: string } }) {
  await auth.protect();
  
  let project = null;
  let findings = [];
  let testRuns = [];
  try {
    project = await getProject(params.id);
    findings = await getFindings(params.id);
    testRuns = await getTestRuns(params.id);
  } catch (error) {
    console.error("Failed to fetch project details", error);
  }

  const activeFindings = findings.filter((f: any) => f.status !== 'resolved');
  const lastTestRun = testRuns.length > 0 ? new Date(testRuns[0].created_at).toLocaleString() : 'Never';

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
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{lastTestRun}</div>
        </div>

        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Findings</div>
          <div className="text-sm font-medium text-rose-600 dark:text-rose-400">{activeFindings.length} Issues</div>
        </div>

        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Project Targets</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project?.targets?.length || 0} Environment(s)</div>
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
            {testRuns.slice(0, 3).map((run: any) => (
              <div key={run.id} className="p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Test Run {run.status}</span>
                  <span className="text-gray-500">{new Date(run.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Run ID: <span className="font-mono text-xs">{run.id.split('-')[0]}</span>.</p>
              </div>
            ))}
            {testRuns.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No recent activity.</div>
            )}
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
                <span className="text-gray-600 dark:text-gray-400">Total Runs</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">{testRuns.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Findings</span>
                <span className="text-gray-900 dark:text-gray-100">{findings.length}</span>
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

