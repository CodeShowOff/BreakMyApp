import { auth } from '@clerk/nextjs/server';
import { History as HistoryIcon, Search, Filter } from "lucide-react";
import Link from "next/link";

import { use } from "react";
export default async function TestHistory(props: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  return (
    <div className="max-w-6xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" /> Test History
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review past execution logs and generated reports.</p>
        </div>
      </header>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search test runs..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 transition-shadow"
          />
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 px-4 py-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Environment</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
            {[
              { id: "tr_893jd2", date: "Oct 24, 2026 14:30", env: "Production", type: "Full", status: "Completed", findings: 1 },
              { id: "tr_882cc1", date: "Oct 23, 2026 09:15", env: "Staging", type: "Regression", status: "Completed", findings: 0 },
              { id: "tr_871bb9", date: "Oct 22, 2026 16:45", env: "Development", type: "Targeted", status: "Failed", findings: 0 },
              { id: "tr_860aa8", date: "Oct 20, 2026 11:20", env: "Production", type: "Full", status: "Completed", findings: 3 },
            ].map((run) => (
              <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                  <Link href={`/projects/${unwrappedParams.id}/runs/${run.id}`} className="hover:underline text-gray-900 dark:text-gray-100">{run.id}</Link>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.date}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{run.env}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{run.type}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                      run.status === 'Completed' 
                        ? 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10' 
                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {run.findings > 0 ? (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                      {run.findings}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
