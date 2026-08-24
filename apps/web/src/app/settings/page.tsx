import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import Link from "next/link";

export default async function Settings() {
  await auth.protect();
  
  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-blue-400 mb-8">BreakMyApp</h1>
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800 text-slate-300">Dashboard</Link>
            <Link href="/projects" className="block px-4 py-2 rounded hover:bg-slate-800 text-slate-300">Projects</Link>
            <Link href="/settings" className="block px-4 py-2 rounded bg-blue-900/30 text-blue-400 font-medium">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium">Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Organization Settings</h2>
          <p className="text-slate-400 mt-1">Manage team members, billing, and audit logs.</p>
        </header>

        <div className="space-y-12">
          {/* Team Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Team Members</h3>
            <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80 text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Member</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <tr className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-6 py-4">admin@example.com</td>
                    <td className="px-6 py-4"><span className="bg-blue-900/40 text-blue-400 px-2 py-1 rounded text-xs border border-blue-800/50">Owner</span></td>
                    <td className="px-6 py-4 text-slate-400">Oct 24, 2026</td>
                    <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-white">Edit</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Audit Logs Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Audit Logs</h3>
            <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 text-center text-slate-400">
              No recent audit logs found for this organization.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
