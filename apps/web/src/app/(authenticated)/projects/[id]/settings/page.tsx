import { auth } from '@clerk/nextjs/server';
import { Settings2, Save, Link2 } from "lucide-react";

export default async function TargetSettings() {
  await auth.protect();
  
  return (
    <div className="max-w-4xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Target Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure target boundaries, environments, and network restrictions.
          </p>
        </div>
        <button className="bg-blue-600 dark:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </header>

      <div className="space-y-6">
        <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Primary Target</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
              <input type="text" defaultValue="Invoicing App (Prod)" className="w-full max-w-md bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base URL</label>
              <input type="text" defaultValue="https://app.example.com" className="w-full max-w-md bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Environment</label>
              <select className="w-full max-w-md bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Development</option>
                <option>Staging</option>
                <option>Preview</option>
                <option selected>Production</option>
              </select>
            </div>
          </div>
        </section>

        <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Testing Scope Boundaries</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-3xl">
              Specify the explicit boundaries the agent is authorized to explore. Any requests attempting to exit this scope will be automatically blocked by the execution proxy.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed Hostnames</label>
              <textarea 
                defaultValue="app.example.com\napi.example.com"
                rows={3}
                className="w-full max-w-md bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">One hostname per line. Wildcards are not supported for security reasons.</p>
            </div>
            
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed Ports</label>
              <input type="text" defaultValue="443" className="w-full max-w-md bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
              <p className="text-xs text-gray-500 mt-1">Comma separated list (e.g., 80, 443).</p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-white/10">
               <div>
                 <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Authorization Status</div>
                 <div className="text-xs text-gray-500 max-w-lg">
                   By checking this box, you confirm that you have explicit authorization to perform adversarial security testing against these hostnames.
                 </div>
               </div>
               <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 dark:border-white/20 text-blue-600 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        <section className="border border-red-200 dark:border-red-900/30 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <div className="bg-red-50 dark:bg-red-900/10 px-4 py-3 border-b border-red-200 dark:border-red-900/30">
            <h2 className="text-sm font-medium text-red-700 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete Project</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
                  Permanently delete this project, including all execution history, baselines, and findings.
                </p>
              </div>
              <button className="bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Delete Project
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
