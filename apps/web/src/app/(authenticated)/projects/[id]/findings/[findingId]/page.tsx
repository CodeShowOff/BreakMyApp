import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, ExternalLink, PlaySquare, FileJson, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getFinding } from "@/lib/api";

import { use } from "react";
export default async function FindingDetail(props: { params: Promise<{ id: string, findingId: string }> }) {
  const unwrappedParams = use(props.params);
  await auth.protect();
  
  let finding = null;
  try {
    finding = await getFinding(unwrappedParams.id, unwrappedParams.findingId);
  } catch (error) {
    console.error("Failed to fetch finding", error);
  }

  if (!finding) {
    return <div className="p-8 text-white">Finding not found.</div>;
  }

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
                {finding.title}
              </h1>
              <span className={`text-xs font-medium px-2 py-1 rounded border ${
                    finding.status === 'resolved' 
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50'
                      : finding.status === 'verifying'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
                  }`}>
                {finding.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-900 dark:text-gray-300">
                {finding.id.split('-')[0]}
              </span>
              <span>Discovered {new Date(finding.first_detected).toLocaleDateString()}</span>
              <span className={`flex items-center gap-1 ${
                    finding.severity === 'high' || finding.severity === 'critical' 
                      ? 'text-rose-500' 
                      : finding.severity === 'medium'
                      ? 'text-amber-500'
                      : 'text-gray-500'
                  }`}><ShieldAlert className="h-4 w-4" /> {finding.severity} Risk</span>
            </div>
          </div>
          <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            Retest Finding
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <section className="border border-gray-200 dark:border-white/10 rounded overflow-hidden bg-white dark:bg-[#0f0f0f]">
            <div className="bg-gray-50 dark:bg-[#151515] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Finding Explanation</h2>
            </div>
            <div className="p-4 text-sm text-gray-700 dark:text-gray-300 space-y-4">
              <p>
                {finding.details?.explanation || "No explanation provided."}
              </p>
              {finding.impact && (
                <div>
                  <strong className="text-gray-900 dark:text-gray-100 block mb-1">Impact:</strong>
                  <p>{finding.impact}</p>
                </div>
              )}
              {finding.reproduction_steps && (
                <div>
                  <strong className="text-gray-900 dark:text-gray-100 block mb-1">Reproduction Steps:</strong>
                  <ol className="list-decimal pl-5 space-y-1">
                    {Array.isArray(finding.reproduction_steps) ? (
                      finding.reproduction_steps.map((step: string, index: number) => <li key={index}>{step}</li>)
                    ) : (
                      <li>{JSON.stringify(finding.reproduction_steps)}</li>
                    )}
                  </ol>
                </div>
              )}
            </div>
          </section>

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
              <div className="bg-gray-800 h-8 flex items-center px-4 rounded-t-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-gray-700 h-5 rounded mx-auto max-w-sm flex items-center px-2 text-[10px] text-gray-300 font-mono overflow-hidden whitespace-nowrap">
                    {finding.target_id || "Unknown target"}
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 h-64 flex items-center justify-center p-4">
                 <div className="text-left w-full h-full bg-gray-950 p-4 font-mono text-xs text-gray-300 rounded overflow-auto border border-gray-800">
                    <pre>{JSON.stringify(finding.evidence, null, 2) || "No evidence data."}</pre>
                 </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-gray-200 dark:border-white/10 rounded p-4 bg-gray-50 dark:bg-[#0f0f0f]">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Remediation Advice</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              {finding.recommended_remediation || "No remediation advice provided."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
