import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import Link from "next/link";

export default async function Projects() {
  await auth.protect();
  
  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-blue-400 mb-8">BreakMyApp</h1>
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-slate-800 text-slate-300">Dashboard</Link>
            <Link href="/projects" className="block px-4 py-2 rounded bg-blue-900/30 text-blue-400 font-medium">Projects</Link>
            <Link href="/settings" className="block px-4 py-2 rounded hover:bg-slate-800 text-slate-300">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <UserButton />
          <span className="text-sm font-medium">Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-slate-400 mt-1">Manage your application targets.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20">
            + New Project
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Card */}
          <Link href="/projects/example-project" className="group">
            <div className="bg-slate-800/40 hover:bg-slate-800/80 p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200 cursor-pointer h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold group-hover:text-blue-400 transition-colors">Invoicing App (Prod)</h3>
                <span className="bg-emerald-900/40 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-800/50">Active</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2">Production multi-tenant invoicing application target for adversarial testing.</p>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last run: 2 hours ago</span>
                <span>3 Findings</span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
