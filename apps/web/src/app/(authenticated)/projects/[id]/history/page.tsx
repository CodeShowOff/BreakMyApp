import { auth } from '@clerk/nextjs/server';
import { History as HistoryIcon, Search, Filter } from "lucide-react";
import Link from "next/link";
import { getTestRuns } from "@/lib/api";

import { use } from "react";
export default async function TestHistory(props: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  let testRuns = [];
  try {
    testRuns = await getTestRuns(unwrappedParams.id);
  } catch (error) {
    console.error("Failed to fetch test runs", error);
  }

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
            {testRuns.map((run: any) => (
              <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                  <Link href={`/projects/${unwrappedParams.id}/runs/${run.id}`} className="hover:underline text-gray-900 dark:text-gray-100">{run.id.split('-')[0]}</Link>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(run.created_at).toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{run.target_id}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Full</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded border flex w-max ${
                      run.status === 'completed' 
                        ? 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10' 
                        : run.status === 'running' || run.status === 'pending'
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {/* Ideally fetch findings count for the run */}
                  <span className="text-gray-400">-</span>
                </td>
              </tr>
            ))}
            {testRuns.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">No test runs available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
