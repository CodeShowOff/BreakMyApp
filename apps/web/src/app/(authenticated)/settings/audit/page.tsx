import { auth } from '@clerk/nextjs/server';
import { Search, Download } from "lucide-react";

export default async function AuditLog() {
  await auth.protect();
  
  return (
    <div className="max-w-4xl">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Audit Log</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review actions taken by team members and automated systems.</p>
        </div>
        <button className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </header>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filter by user or event..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600 transition-shadow"
          />
        </div>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 text-gray-500 font-mono text-xs">Oct 25, 2026 09:12:33</td>
              <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">admin@acmecorp.com</td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Triggered test run</td>
              <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">tr_893jd2</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 text-gray-500 font-mono text-xs">Oct 25, 2026 08:05:11</td>
              <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">System</td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Marked finding as resolved</td>
              <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">fnd_7m99</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 text-gray-500 font-mono text-xs">Oct 24, 2026 14:10:00</td>
              <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">admin@acmecorp.com</td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Created credential</td>
              <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">Tenant Admin</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
