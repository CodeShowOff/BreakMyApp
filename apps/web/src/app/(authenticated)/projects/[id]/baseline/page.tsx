import { auth } from '@clerk/nextjs/server';
import { Database, GitCommit, Download, History } from "lucide-react";
import { getApplicationModels } from "@/lib/api";

import { use } from "react";
export default async function SecurityBaseline(props: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  let models = [];
  try {
    models = await getApplicationModels(unwrappedParams.id);
  } catch (error) {
    console.error("Failed to fetch application models", error);
  }

  // Use the most recent model as current active baseline for demonstration
  const activeModel = models.length > 0 ? models[0] : null;

  return (
    <div className="max-w-4xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Database className="h-5 w-5" /> Security Baseline
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          The verified stable state of the application. Future tests use this to detect regressions.
        </p>
      </header>

      {activeModel ? (
        <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a] mb-8">
          <div className="bg-gray-50 dark:bg-[#151515] px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Current Active Baseline</h2>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                Verified
              </span>
            </div>
            <button className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Download className="h-4 w-4" /> Export JSON
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Baseline Version</div>
                <div className="font-mono text-gray-900 dark:text-gray-100">{activeModel.version}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created</div>
                <div className="text-gray-900 dark:text-gray-100">{new Date(activeModel.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Endpoints</div>
                <div className="text-gray-900 dark:text-gray-100">{Object.keys(activeModel.endpoints || {}).length} discovered endpoints</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">App Model ID</div>
                <div className="font-mono text-gray-900 dark:text-gray-100">{activeModel.id.split('-')[0]}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Actors</div>
                <div className="text-gray-900 dark:text-gray-100">{Object.keys(activeModel.actors || {}).length} identified roles</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a] mb-8 p-12 text-center text-gray-500">
          No baseline models available.
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <History className="h-4 w-4" /> Baseline History
      </h3>
      
      <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
              <th className="py-3 px-4 font-medium text-gray-500">Version</th>
              <th className="py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="py-3 px-4 font-medium text-gray-500">Model ID</th>
              <th className="py-3 px-4 font-medium text-gray-500">Endpoints</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {models.map((model: any, index: number) => (
              <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <GitCommit className={`h-4 w-4 ${index === 0 ? 'text-emerald-500' : 'text-gray-400'}`} /> {model.version}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(model.created_at).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">{model.id.split('-')[0]}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{Object.keys(model.endpoints || {}).length}</td>
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">No baseline history available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
