import { auth } from '@clerk/nextjs/server';
import { Network, Users, Database, ArrowRight, Waypoints } from "lucide-react";

export default async function ApplicationModel() {
  await auth.protect();
  
  return (
    <div className="max-w-6xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Network className="h-5 w-5" /> Application Model
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Visualizing the discovered roles, objects, relationships, and workflows from exploratory testing.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-5 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Users className="h-4 w-4" /> Discovered Roles
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">3</div>
        </div>
        <div className="p-5 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Database className="h-4 w-4" /> Object Types
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">12</div>
        </div>
        <div className="p-5 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            <Waypoints className="h-4 w-4" /> Action Endpoints
          </div>
          <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">45</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="border border-gray-200 dark:border-white/10 rounded bg-white dark:bg-[#0a0a0a] overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Roles Map</h2>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="p-3 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Tenant Admin</div>
                <div className="text-gray-500 text-xs flex gap-2 flex-wrap">
                  <span className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">Create User</span>
                  <span className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">View Invoices</span>
                  <span className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">Manage Settings</span>
                </div>
              </div>
              <div className="p-3 border border-gray-200 dark:border-white/10 rounded bg-gray-50 dark:bg-[#0f0f0f]">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Standard User</div>
                <div className="text-gray-500 text-xs flex gap-2 flex-wrap">
                  <span className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">View Invoices</span>
                  <span className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded">Submit Ticket</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-gray-200 dark:border-white/10 rounded bg-white dark:bg-[#0a0a0a] overflow-hidden">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Discovered Object Relationships</h2>
            </div>
            <div className="p-6 font-mono text-xs flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-white/10">
               {/* A lightweight representation of a graph */}
               <div className="flex items-center gap-8 text-gray-500 dark:text-gray-400">
                 <div className="border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded">Tenant</div>
                 <ArrowRight className="h-4 w-4" />
                 <div className="flex flex-col gap-4">
                   <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 rounded text-gray-700 dark:text-gray-300">User</div>
                   <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 rounded text-gray-700 dark:text-gray-300">Invoice</div>
                   <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 rounded text-gray-700 dark:text-gray-300">Project</div>
                 </div>
               </div>
            </div>
            <div className="p-4 text-xs text-gray-500">
              Model Version: <span className="font-mono text-gray-900 dark:text-gray-300">am_8f92k</span> (Generated automatically during exploration)
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
