import { auth } from '@clerk/nextjs/server';
import { BookOpen, Plus, Shield, ShieldAlert, MoreVertical } from "lucide-react";

export default async function BusinessRules() {
  await auth.protect();
  
  return (
    <div className="max-w-5xl">
      <header className="mb-8 border-b border-gray-200 dark:border-white/10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Business & Security Rules
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define boundaries and expected application behavior for the adversarial testing engine.
          </p>
        </div>
        <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Rule
        </button>
      </header>

      <div className="space-y-6">
        <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" /> Cross-Tenant Boundaries
            </h2>
            <span className="text-xs bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">High Priority</span>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-white/10">
            <div className="p-4 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Strict Tenant Isolation</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
                  A user belonging to Tenant A must never be able to access, modify, or delete any resource belonging to Tenant B, under any circumstances, even via direct IDOR or API manipulation.
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="text-xs font-mono bg-gray-100 dark:bg-[#1a1a1a] px-2 py-1 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10">Scope: Global</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><MoreVertical className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
          <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-gray-500" /> Role Boundaries
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-white/10">
            <div className="p-4 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Admin Privilege Escalation</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
                  A standard user must not be able to perform administrative actions, such as inviting new users or changing billing details, by manipulating request payloads or bypassing frontend checks.
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="text-xs font-mono bg-gray-100 dark:bg-[#1a1a1a] px-2 py-1 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10">Scope: Users, Settings, Billing</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><MoreVertical className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
