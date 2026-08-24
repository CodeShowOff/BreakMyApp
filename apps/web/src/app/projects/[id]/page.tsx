import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import Link from "next/link";

export default async function ProjectOverview({ params }: { params: { id: string } }) {
  await auth.protect();
  const projectId = params.id;
  
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
            <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm">
              <Link href="/projects" className="hover:text-blue-400 transition-colors">Projects</Link>
              <span>/</span>
              <span>Overview</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Project Overview</h2>
            <p className="text-slate-400 mt-1">Project ID: {projectId}</p>
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
            Project Settings
          </button>
        </header>

        <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-700/50 mb-8">
          <h3 className="text-xl font-semibold mb-4">Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1">Status</p>
              <span className="bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded-full border border-emerald-800/50 text-xs">Active</span>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Testing Targets</p>
              <p className="text-slate-200 font-medium">1 configured</p>
            </div>
            <div className="mt-4">
              <p className="text-slate-400 mb-1">Recent Findings</p>
              <p className="text-slate-200 font-medium">3 issues detected</p>
            </div>
            <div className="mt-4">
              <p className="text-slate-400 mb-1">Last Test Run</p>
              <p className="text-slate-200 font-medium">2 hours ago</p>
            </div>
          </div>
        </div>

        {/* Action placeholders based on Phase 1 Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Team Access</h3>
            <p className="text-sm text-slate-400 mb-4">Manage users and roles (Owner, Admin, Member, Viewer) for this project.</p>
            <button className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors">Manage Team</button>
          </div>
          
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Credentials</h3>
            <p className="text-sm text-slate-400 mb-4">Manage secrets and authentication configurations for testing targets.</p>
            <button className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition-colors">Manage Credentials</button>
          </div>
        </div>
      </main>
    </div>
  );
}
