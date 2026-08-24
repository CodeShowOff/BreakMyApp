import { auth } from '@clerk/nextjs/server';
import { BookOpen, Plus, Shield, ShieldAlert, MoreVertical } from "lucide-react";
import { getBusinessRules } from "@/lib/api";

import { use } from "react";
export default async function BusinessRules(props: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  let rules = [];
  try {
    rules = await getBusinessRules(unwrappedParams.id);
  } catch (error) {
    console.error("Failed to fetch business rules", error);
  }

  // Group rules by category
  const rulesByCategory = rules.reduce((acc: any, rule: any) => {
    const category = rule.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(rule);
    return acc;
  }, {});

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
        {Object.entries(rulesByCategory).map(([category, catRules]: [string, any]) => (
          <section key={category} className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" /> {category}
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {catRules.map((rule: any) => (
                <div key={rule.id} className="p-4 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      {rule.name}
                      {rule.priority && (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-900/20 px-2 py-0.5 rounded border border-violet-800/50">
                          {rule.priority} Priority
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">
                      {rule.description}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><MoreVertical className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>
        ))}
        {rules.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
            No rules defined.
          </div>
        )}
      </div>
    </div>
  );
}
