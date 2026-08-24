import { auth } from '@clerk/nextjs/server';
import { CheckCircle2, Circle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTestRun } from "@/lib/api";

import { use } from "react";
export default async function RunDetails(props: { params: Promise<{ id: string, runId: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  let run = null;
  try {
    run = await getTestRun(unwrappedParams.id, unwrappedParams.runId);
  } catch (error) {
    console.error("Failed to fetch test run", error);
  }

  if (!run) {
    return <div className="p-8 text-white">Test run not found.</div>;
  }

  // Use real step data if available, otherwise fallback to defaults for demonstration
  const steps = run.execution_progress?.steps || [
    { name: "Preparing sandbox", status: "completed", time: "2s" },
    { name: "Authenticating", status: "completed", time: "5s" },
    { name: "Exploring", status: "completed", time: "45s" },
    { name: "Building model", status: "completed", time: "12s" },
    { name: "Generating tests", status: "completed", time: "30s" },
    { name: "Executing tests", status: "in-progress", time: "Running..." },
    { name: "Verifying", status: "pending", time: "--" },
    { name: "Reporting", status: "pending", time: "--" },
  ];

  const isCompleted = run.status === 'completed';
  const isRunning = run.status === 'running' || run.status === 'pending';

  return (
    <div className="max-w-4xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
        <Link href={`/projects/${unwrappedParams.id}/history`} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
              Test Run <span className="font-mono text-sm bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">{unwrappedParams.runId.split('-')[0]}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Target: {run.target_id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded border ${
              isCompleted
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50'
                : isRunning
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50'
                : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
            }`}>
              {isRunning && <Loader2 className="h-4 w-4 animate-spin" />} 
              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
            </span>
            {isRunning && (
              <button className="bg-white dark:bg-transparent border border-gray-200 dark:border-white/20 text-red-600 dark:text-red-400 px-3 py-1 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Cancel Run
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Execution Progress</h2>
            </div>
            <div className="p-4 space-y-4">
              {steps.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {step.status === 'in-progress' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                    {step.status === 'pending' && <Circle className="h-4 w-4 text-gray-300 dark:text-gray-700" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-gray-900 dark:text-gray-100' : 
                      step.status === 'in-progress' ? 'text-blue-600 dark:text-blue-400' : 
                      'text-gray-500 dark:text-gray-600'
                    }`}>
                      {step.name}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono text-right">{step.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Live Execution Log</h2>
              <span className="text-xs text-gray-500">Auto-scrolling</span>
            </div>
            <div className="p-4 font-mono text-xs bg-gray-50 dark:bg-black h-80 overflow-y-auto space-y-2 text-gray-600 dark:text-gray-400">
              {run.execution_progress?.logs ? run.execution_progress.logs.map((log: string, idx: number) => (
                <div key={idx}>{log}</div>
              )) : (
                <>
                  <div className="text-emerald-600 dark:text-emerald-400">[00:00:00] Initializing run environment...</div>
                  <div>[00:00:02] Sandbox provisioned successfully (id: sbx_9ja21)</div>
                  <div className="text-emerald-600 dark:text-emerald-400">[00:00:02] Authenticating identities...</div>
                  <div>[00:00:05] Tenant Admin authenticated.</div>
                  <div>[00:00:06] Standard User authenticated.</div>
                  <div>[00:00:07] Cross-Tenant User authenticated.</div>
                  <div className="text-emerald-600 dark:text-emerald-400">[00:00:07] Beginning exploratory phase...</div>
                  <div>[00:00:15] Discovered 45 endpoints.</div>
                  <div>[00:00:25] Mapped 3 roles and 12 object types.</div>
                  <div className="text-emerald-600 dark:text-emerald-400">[00:00:52] Building application model...</div>
                  <div>[00:01:04] Model construction complete.</div>
                  <div className="text-emerald-600 dark:text-emerald-400">[00:01:04] Generating adversarial hypotheses...</div>
                  <div>[00:01:20] Generated 24 bounded hypotheses based on authorization boundaries.</div>
                  <div>[00:01:34] Strategy optimization complete.</div>
                  <div className="text-blue-600 dark:text-blue-400">[00:01:34] Executing tests (0/24)...</div>
                  <div>[00:01:45] Executing tests (5/24)...</div>
                  <div className="text-amber-600 dark:text-amber-400">[00:01:50] Discovered potential vulnerabilities.</div>
                  {isRunning && (
                    <div className="flex items-center gap-2 mt-4 text-blue-500">
                      <Loader2 className="h-3 w-3 animate-spin" /> <span>Executing tests...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="border border-gray-200 dark:border-white/10 rounded p-4 bg-white dark:bg-[#0f0f0f]">
               <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Candidate Findings</div>
               <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">1</div>
             </div>
             <div className="border border-gray-200 dark:border-white/10 rounded p-4 bg-white dark:bg-[#0f0f0f]">
               <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tests Completed</div>
               <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">12 / 24</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
