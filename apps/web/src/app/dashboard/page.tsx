import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import Link from "next/link";

export default async function Dashboard() {
  await auth.protect();

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 p-6 flex flex-col justify-between border-r border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-blue-400 mb-8">BreakMyApp</h1>
          <nav className="space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 rounded bg-blue-900/30 text-blue-400 font-medium">Dashboard</Link>
            <Link href="/projects" className="block px-4 py-2 rounded hover:bg-slate-800 text-slate-300">Projects</Link>
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
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-slate-400 mt-1">Overview of your security testing status.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Stats Cards */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-400">Total Projects</h3>
            <p className="text-4xl font-semibold mt-2">12</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-400">Active Findings</h3>
            <p className="text-4xl font-semibold text-rose-400 mt-2">4</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-400">Test Runs (30d)</h3>
            <p className="text-4xl font-semibold text-emerald-400 mt-2">1,204</p>
          </div>
        </div>
      </main>
    </div>
  );
}
