import { auth } from '@clerk/nextjs/server';
import { Settings2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

import { use } from "react";
export default async function RunTest(props: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  return (
    <div className="max-w-3xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Start New Test Run</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure parameters and trigger an adversarial test against the target.</p>
      </header>

      <div className="space-y-6">
        <div className="border border-gray-200 dark:border-white/10 rounded p-5 bg-white dark:bg-[#0f0f0f]">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-gray-500" /> Run Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Environment</label>
              <select className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500">
                <option>Staging (https://staging.example.com)</option>
                <option>Production (https://app.example.com)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Scope</label>
              <select className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500">
                <option>Full Application (Exploration + Rules + Discovery)</option>
                <option>Targeted (Only test defined business rules)</option>
                <option>Regression (Re-test existing findings only)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-white/10 rounded p-5 bg-white dark:bg-[#0f0f0f]">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-gray-500" /> Identities & Authorization
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#151515]">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-white/20 text-gray-900 focus:ring-gray-900" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Tenant Admin</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">admin@tenant-a.com</div>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#151515]">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-white/20 text-gray-900 focus:ring-gray-900" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Standard User</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">user@tenant-a.com</div>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">Ready</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#151515]">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-white/20 text-gray-900 focus:ring-gray-900" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Cross-Tenant User</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">user@tenant-b.com</div>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">Ready</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-white/10">
          <Link href={`/projects/${unwrappedParams.id}/runs/tr_new_demo`}>
            <button className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-2.5 rounded font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              <Zap className="h-4 w-4" /> Start Execution
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
