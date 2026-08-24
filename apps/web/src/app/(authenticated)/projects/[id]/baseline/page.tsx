import { auth } from '@clerk/nextjs/server';
import { Database, GitCommit, Download, History } from "lucide-react";

export default async function SecurityBaseline() {
  await auth.protect();
  
  return (
    <div className="max-w-4xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Database className="h-5 w-5" /> Security Baseline
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          The verified stable state of the application. Future tests use this to detect regressions.
        </p>
      </header>

      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a] mb-8">
        <div className="bg-gray-50 dark:bg-[#151515] px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Current Active Baseline</h2>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
              Verified
            </span>
          </div>
          <button className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <Download className="h-4 w-4" /> Export JSON
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Baseline Version</div>
              <div className="font-mono text-gray-900 dark:text-gray-100">v1.4.2</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Generated From</div>
              <div className="font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">tr_893jd2</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</div>
              <div className="text-gray-900 dark:text-gray-100">Oct 24, 2026 14:32</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">App Model Version</div>
              <div className="font-mono text-gray-900 dark:text-gray-100">am_8f92k</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Strategy Version</div>
              <div className="font-mono text-gray-900 dark:text-gray-100">st_192ja</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Finding Fingerprints</div>
              <div className="text-gray-900 dark:text-gray-100">42 verified fingerprints</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <History className="h-4 w-4" /> Baseline History
      </h3>
      
      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 font-medium text-gray-500">Version</th>
              <th className="py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="py-3 px-4 font-medium text-gray-500">Run ID</th>
              <th className="py-3 px-4 font-medium text-gray-500">Fingerprints</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-emerald-500" /> v1.4.2
              </td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Oct 24, 2026</td>
              <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">tr_893jd2</td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">42</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-gray-500">
              <td className="py-3 px-4 font-mono flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-gray-400" /> v1.4.1
              </td>
              <td className="py-3 px-4">Oct 15, 2026</td>
              <td className="py-3 px-4 font-mono hover:underline cursor-pointer">tr_512aa1</td>
              <td className="py-3 px-4">39</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors text-gray-500">
              <td className="py-3 px-4 font-mono flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-gray-400" /> v1.4.0
              </td>
              <td className="py-3 px-4">Sep 28, 2026</td>
              <td className="py-3 px-4 font-mono hover:underline cursor-pointer">tr_109zz9</td>
              <td className="py-3 px-4">38</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
