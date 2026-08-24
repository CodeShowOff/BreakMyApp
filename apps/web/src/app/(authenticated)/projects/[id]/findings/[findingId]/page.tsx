import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, ExternalLink, PlaySquare, FileJson, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { use } from "react";
export default async function FindingDetail(props: { params: Promise<{ id: string, findingId: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  return (
    <div className="max-w-6xl">
      <header className="mb-6">
        <Link href={`/projects/${unwrappedParams.id}/findings`} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Findings
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Cross-Tenant Data Exposure via IDOR
              </h1>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded border border-rose-200 dark:border-rose-900/50">
                Confirmed
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-900 dark:text-gray-300">
                {unwrappedParams.findingId}
              </span>
              <span>Discovered 2 days ago</span>
              <span className="flex items-center gap-1"><ShieldAlert className="h-4 w-4 text-rose-500" /> High Risk</span>
            </div>
          </div>
          <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            Retest Finding
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Explanation Section */}
          <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Finding Explanation</h2>
            </div>
            <div className="p-4 text-sm text-gray-700 dark:text-gray-300 space-y-4">
              <p>
                The application fails to properly enforce authorization checks on the <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-rose-600 dark:text-rose-400">/api/invoices/[id]</code> endpoint. 
                A standard user belonging to Tenant A was able to directly access an invoice belonging to Tenant B by enumerating the sequential invoice ID.
              </p>
              <div>
                <strong className="text-gray-900 dark:text-gray-100 block mb-1">Impact:</strong>
                <p>Unauthorized access to sensitive billing data across tenant boundaries.</p>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-gray-100 block mb-1">Reproduction Steps:</strong>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Authenticate as User A (Tenant A).</li>
                  <li>Observe an invoice belonging to Tenant A (e.g. ID: 1042).</li>
                  <li>Send a direct GET request to <code>/api/invoices/1043</code> (belonging to Tenant B).</li>
                  <li>Observe the response containing Tenant B&apos;s invoice details.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Evidence Viewer */}
          <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Evidence Viewer
              </h2>
              <div className="flex gap-2">
                <button className="text-xs flex items-center gap-1 bg-white dark:bg-[#202020] border border-gray-200 dark:border-white/10 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300">
                  <PlaySquare className="h-3 w-3" /> Replay
                </button>
                <button className="text-xs flex items-center gap-1 bg-white dark:bg-[#202020] border border-gray-200 dark:border-white/10 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300">
                  <FileJson className="h-3 w-3" /> Raw Trace
                </button>
              </div>
            </div>
            
            <div className="p-0 border-b border-gray-200 dark:border-white/10 relative">
              {/* Fake Browser View */}
              <div className="bg-gray-800 h-8 flex items-center px-4 rounded-t-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-gray-700 h-5 rounded mx-auto max-w-sm flex items-center px-2 text-[10px] text-gray-300 font-mono overflow-hidden whitespace-nowrap">
                    https://app.example.com/api/invoices/1043
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 h-64 flex items-center justify-center p-4">
                 <div className="text-left w-full h-full bg-gray-950 p-4 font-mono text-xs text-gray-300 rounded overflow-auto border border-gray-800">
                   <span className="text-rose-400">HTTP/2 200 OK</span><br/>
                   <span>content-type: application/json</span><br/>
                   <br/>
                   {'{'}<br/>
                   &nbsp;&nbsp;&quot;id&quot;: 1043,<br/>
                   &nbsp;&nbsp;&quot;tenant_id&quot;: &quot;org_b7x9&quot;,<br/>
                   &nbsp;&nbsp;&quot;amount&quot;: 4500.00,<br/>
                   &nbsp;&nbsp;&quot;customer_name&quot;: &quot;[REDACTED_BY_SYSTEM]&quot;,<br/>
                   &nbsp;&nbsp;&quot;status&quot;: &quot;paid&quot;<br/>
                   {'}'}
                 </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-white/[0.02]">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-3">Sanitized Request Metadata</h3>
              <div className="grid grid-cols-2 gap-4 text-sm font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-black p-3 rounded border border-gray-200 dark:border-white/10">
                <div>
                  <div className="text-gray-400 dark:text-gray-600 text-xs">Method</div>
                  <div className="text-emerald-600 dark:text-emerald-400">GET</div>
                </div>
                <div>
                  <div className="text-gray-400 dark:text-gray-600 text-xs">Path</div>
                  <div>/api/invoices/1043</div>
                </div>
                <div>
                  <div className="text-gray-400 dark:text-gray-600 text-xs">Actor</div>
                  <div>User A (org_a1x2)</div>
                </div>
                <div>
                  <div className="text-gray-400 dark:text-gray-600 text-xs">Auth Header</div>
                  <div>Bearer [REDACTED_TOKEN_org_a1x2]</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Timeline</h2>
            </div>
            <div className="p-4">
              <div className="relative border-l border-gray-200 dark:border-white/10 ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute w-2 h-2 bg-rose-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white dark:ring-[#0f0f0f]"></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Verified & Confirmed</p>
                  <p className="text-xs text-gray-500">Oct 24, 14:32 (System)</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white dark:ring-[#0f0f0f]"></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Independent Verification</p>
                  <p className="text-xs text-gray-500">Oct 24, 14:30 (Verifier Agent)</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute w-2 h-2 bg-gray-400 rounded-full -left-[5px] top-1.5 ring-4 ring-white dark:ring-[#0f0f0f]"></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Candidate Discovered</p>
                  <p className="text-xs text-gray-500">Oct 24, 14:28 (Test Strategy)</p>
                </div>
              </div>
            </div>
          </section>
          
          <section className="border border-gray-200 dark:border-white/10 rounded p-4 bg-gray-50 dark:bg-[#0f0f0f]">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Remediation Advice</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Implement object-level authorization on this endpoint. The server must verify that the authenticated user&apos;s tenant ID matches the `tenant_id` of the requested invoice object before returning the resource.
            </p>
            <a href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View secure coding guidelines <ExternalLink className="h-3 w-3" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
