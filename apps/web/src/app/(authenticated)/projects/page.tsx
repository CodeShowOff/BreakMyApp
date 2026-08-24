import { auth } from '@clerk/nextjs/server';
import Link from "next/link";
import { FolderKanban, Plus, Search, ShieldCheck, ShieldAlert, Clock } from "lucide-react";

export default async function Projects() {
  await auth.protect();
  
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-950 text-white font-sans">
      <header className="mb-8 border-b border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Projects</h1>
          <p className="text-sm text-neutral-500 font-bold tracking-widest uppercase mt-2">Manage your application targets and testing scopes.</p>
        </div>
        <button className="bg-violet-800 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-violet-900 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Project
        </button>
      </header>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="SEARCH PROJECTS..." 
            className="w-full pl-9 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold tracking-widest uppercase text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-violet-800 focus:border-violet-800 transition-shadow"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Project Card */}
        <Link href="/projects/example-project" className="group block">
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-violet-800 transition-colors h-full flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-black tracking-tighter uppercase text-white group-hover:text-violet-400 transition-colors flex items-center gap-3">
                <FolderKanban className="h-4 w-4 text-violet-800" />
                Invoicing App (Prod)
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-900/20 px-2 py-1 rounded border border-violet-800/50">
                Active
              </span>
            </div>
            
            <p className="text-neutral-400 text-sm mb-6 line-clamp-2 flex-1 font-medium leading-relaxed">
              Production multi-tenant invoicing application target for continuous adversarial testing.
            </p>
            
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-neutral-500">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> 2 hours ago
              </div>
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldAlert className="h-3.5 w-3.5" /> 3 Findings
              </div>
            </div>
          </div>
        </Link>
        
        {/* Project Card (Clean) */}
        <Link href="/projects/customer-portal" className="group block">
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-violet-800 transition-colors h-full flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-black tracking-tighter uppercase text-white group-hover:text-violet-400 transition-colors flex items-center gap-3">
                <FolderKanban className="h-4 w-4 text-violet-800" />
                Customer Portal
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-900/20 px-2 py-1 rounded border border-violet-800/50">
                Active
              </span>
            </div>
            
            <p className="text-neutral-400 text-sm mb-6 line-clamp-2 flex-1 font-medium leading-relaxed">
              External facing customer support portal with self-service features.
            </p>
            
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-neutral-500">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> 5 hours ago
              </div>
              <div className="flex items-center gap-2 text-violet-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Clean
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
