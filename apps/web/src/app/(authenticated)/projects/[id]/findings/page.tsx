import { auth } from '@clerk/nextjs/server';
import { Search, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";

import { use } from "react";
export default async function Findings(props: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  return (
    <div className="max-w-6xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Findings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage verified security vulnerabilities.</p>
        </div>
      </header>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search findings..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 transition-shadow"
          />
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 px-4 py-2 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f] flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Verified</span>
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">12</span>
        </div>
        <div className="p-4 border border-rose-200 dark:border-rose-900/30 rounded bg-rose-50 dark:bg-rose-900/10 flex justify-between items-center">
          <span className="text-sm font-medium text-rose-700 dark:text-rose-400">High Risk</span>
          <span className="text-xl font-semibold text-rose-700 dark:text-rose-400">3</span>
        </div>
        <div className="p-4 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f] flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Verifying</span>
          <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">1</span>
        </div>
        <div className="p-4 border border-emerald-200 dark:border-emerald-900/30 rounded bg-emerald-50 dark:bg-emerald-900/10 flex justify-between items-center">
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Resolved</span>
          <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">45</span>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Vulnerability</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Discovered</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
              <td className="py-4 px-4 text-sm font-mono text-gray-500">fnd_9x28</td>
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Cross-Tenant Data Exposure via IDOR</div>
                <div className="text-xs text-gray-500 mt-1">/api/invoices/[id]</div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded border border-rose-200 dark:border-rose-900/50">Confirmed</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-rose-700 dark:text-rose-500">High</span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">2 days ago</td>
              <td className="py-4 px-4 text-right">
                <Link href={`/projects/${unwrappedParams.id}/findings/fnd_9x28`}>
                  <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
              <td className="py-4 px-4 text-sm font-mono text-gray-500">fnd_3b11</td>
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Privilege Escalation in Settings Update</div>
                <div className="text-xs text-gray-500 mt-1">/api/settings/update (Role boundary)</div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-900/50 flex items-center w-max gap-1">
                  Verifying...
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-rose-700 dark:text-rose-500">High</span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">1 hour ago</td>
              <td className="py-4 px-4 text-right">
                <Link href={`/projects/${unwrappedParams.id}/findings/fnd_3b11`}>
                  <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
              <td className="py-4 px-4 text-sm font-mono text-gray-500">fnd_7m99</td>
              <td className="py-4 px-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Information Disclosure via Verbose Errors</div>
                <div className="text-xs text-gray-500 mt-1">/api/users/profile</div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900/50">Resolved</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-amber-700 dark:text-amber-500">Low</span>
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">14 days ago</td>
              <td className="py-4 px-4 text-right">
                <Link href={`/projects/${unwrappedParams.id}/findings/fnd_7m99`}>
                  <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
