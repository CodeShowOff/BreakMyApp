import { auth } from '@clerk/nextjs/server';
import { Plus, MoreVertical } from "lucide-react";

export default async function TeamSettings() {
  await auth.protect();
  
  return (
    <div className="max-w-4xl">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Team Members</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage users and roles (Owner, Admin, Member, Viewer).</p>
        </div>
        <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Invite Member
        </button>
      </header>

      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm">
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 dark:text-gray-100">Jane Doe</div>
                <div className="text-xs text-gray-500">admin@acmecorp.com</div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/50">Owner</span>
              </td>
              <td className="py-4 px-4 text-gray-500">Oct 24, 2026</td>
              <td className="py-4 px-4 text-right">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 dark:text-gray-100">John Smith</div>
                <div className="text-xs text-gray-500">john@acmecorp.com</div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10">Member</span>
              </td>
              <td className="py-4 px-4 text-gray-500">Oct 25, 2026</td>
              <td className="py-4 px-4 text-right">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
