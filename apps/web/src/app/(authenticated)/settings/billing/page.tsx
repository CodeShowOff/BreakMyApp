import { auth } from '@clerk/nextjs/server';
import { CreditCard, Zap, CheckCircle2 } from "lucide-react";

export default async function BillingSettings() {
  await auth.protect();
  
  return (
    <div className="max-w-4xl">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Billing & Subscription</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your plan, payment methods, and usage limits.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-blue-200 dark:border-blue-900/50 rounded overflow-hidden bg-blue-50 dark:bg-blue-900/10 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                <Zap className="h-4 w-4" /> Professional Plan
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">$499<span className="text-sm font-normal text-gray-500"> / month</span></div>
            </div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Current Plan</span>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Up to 5 Active Projects
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Continuous Testing
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Prioritized Independent Verification
            </li>
          </ul>

          <button className="w-full bg-white dark:bg-[#0f0f0f] border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Manage Subscription
          </button>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a] p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" /> Payment Method
            </h3>
            <div className="flex items-center justify-between border border-gray-200 dark:border-white/10 p-3 rounded bg-gray-50 dark:bg-[#151515]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">VISA</div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">•••• •••• •••• 4242</div>
                  <div className="text-xs text-gray-500">Expires 12/28</div>
                </div>
              </div>
              <button className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Edit</button>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0a0a0a] p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Current Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Test Runs</span>
                  <span>142 / 200</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                  <span>Projects</span>
                  <span>3 / 5</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
