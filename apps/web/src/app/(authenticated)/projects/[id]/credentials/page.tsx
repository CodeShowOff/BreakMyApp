import { auth } from '@clerk/nextjs/server';
import { Key, Plus, Lock, Trash2, Edit2 } from "lucide-react";

export default async function Credentials() {
  await auth.protect();
  
  return (
    <div className="max-w-5xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Key className="h-5 w-5" /> Test Credentials
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage authentication details for the test identities used during execution. Secrets are never exposed.
          </p>
        </div>
        <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Credential
        </button>
      </header>

      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Identity Name</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 dark:text-gray-100">Tenant Admin</div>
                <div className="text-xs text-gray-500">admin@tenant-a.com</div>
              </td>
              <td className="py-4 px-4 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Username / Password
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                  Ready
                </span>
              </td>
              <td className="py-4 px-4 text-gray-500">2 hours ago</td>
              <td className="py-4 px-4 text-right">
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1.5 transition-colors"><Edit2 className="h-4 w-4" /></button>
                <button className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 dark:text-gray-100">Standard User</div>
                <div className="text-xs text-gray-500">user@tenant-a.com</div>
              </td>
              <td className="py-4 px-4 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Username / Password
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                  Ready
                </span>
              </td>
              <td className="py-4 px-4 text-gray-500">2 hours ago</td>
              <td className="py-4 px-4 text-right">
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1.5 transition-colors"><Edit2 className="h-4 w-4" /></button>
                <button className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 dark:text-gray-100">Cross-Tenant User</div>
                <div className="text-xs text-gray-500">user@tenant-b.com</div>
              </td>
              <td className="py-4 px-4 text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Username / Password
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                  Ready
                </span>
              </td>
              <td className="py-4 px-4 text-gray-500">2 hours ago</td>
              <td className="py-4 px-4 text-right">
                <button className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1.5 transition-colors"><Edit2 className="h-4 w-4" /></button>
                <button className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
