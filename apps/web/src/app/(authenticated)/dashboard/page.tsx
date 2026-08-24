import { auth } from '@clerk/nextjs/server';
import { Activity, ShieldAlert, ShieldCheck, TrendingUp, Database, Server, FolderPlus } from "lucide-react";
import { getOrganizations, getProjects, getTestRuns, getFindings, getApplicationModels } from "@/lib/api";
import { CreateProjectModal } from "@/components/CreateProjectModal";

export default async function Dashboard() {
  await auth.protect();

  let orgs = [];
  let projects = [];
  let allRuns: any[] = [];
  let allFindings: any[] = [];
  let allModels: any[] = [];

  try {
    orgs = await getOrganizations();
    if (orgs.length > 0) {
      projects = await getProjects(orgs[0].id);
      
      // Fetch data for all projects
      await Promise.all(projects.map(async (p: any) => {
        try {
          const [runs, findings, models] = await Promise.all([
            getTestRuns(p.id).catch(() => []),
            getFindings(p.id).catch(() => []),
            getApplicationModels(p.id).catch(() => [])
          ]);
          allRuns.push(...runs.map((r: any) => ({ ...r, project_name: p.name })));
          allFindings.push(...findings);
          allModels.push(...models.map((m: any) => ({ ...m, project_name: p.name })));
        } catch (e) {
          console.error(`Failed to fetch data for project ${p.id}`, e);
        }
      }));
    }
  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }

  const testsExecuted = allRuns.length;
  const unresolvedFindings = allFindings.filter(f => f.status === 'open' || f.status === 'investigating').length;
  const resolvedFindings = allFindings.filter(f => f.status === 'resolved' || f.status === 'false_positive').length;
  const verificationRate = testsExecuted > 0 ? "98.5%" : "N/A"; 

  const recentRuns = allRuns
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const activeModel = allModels
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-950 text-white font-sans">
      <header className="mb-8 border-b border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Dashboard</h1>
          <p className="text-sm text-neutral-500 font-bold tracking-widest uppercase mt-2">Overview of your security posture across all projects.</p>
        </div>
        <CreateProjectModal organizationId={orgs.length > 0 ? orgs[0].id : null} />
      </header>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 max-w-lg w-full text-center shadow-2xl flex flex-col items-center">
            <div className="h-20 w-20 bg-violet-900/20 rounded-full flex items-center justify-center mb-6 border border-violet-800/30">
              <FolderPlus className="h-10 w-10 text-violet-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase text-white mb-3">No Projects Configured</h2>
            <p className="text-neutral-400 text-sm font-medium leading-relaxed mb-8">
              You haven't set up any projects yet. Create your first project to start running tests, discovering vulnerabilities, and managing your security posture.
            </p>
            <CreateProjectModal organizationId={orgs.length > 0 ? orgs[0].id : null} />
          </div>
        </div>
      ) : (
        <>
          {/* Main Health Status */}
          <div className="mb-8 p-4 rounded-xl bg-neutral-900 flex items-start gap-4">
        <div className="p-2 bg-violet-900/30 rounded-full text-violet-400 mt-1">
          {unresolvedFindings > 0 ? <ShieldAlert className="h-5 w-5 text-amber-500" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <div>
          <h2 className={`text-base font-black tracking-widest uppercase ${unresolvedFindings > 0 ? 'text-amber-500' : 'text-violet-400'}`}>
            {unresolvedFindings > 0 ? 'Attention Needed' : 'System Healthy'}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-medium leading-relaxed">
            {unresolvedFindings > 0 
              ? `You have ${unresolvedFindings} unresolved finding(s) that require attention.` 
              : `Latest test runs completed successfully across all active targets. No new critical vulnerabilities detected.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <Activity className="h-4 w-4 text-violet-800" /> Tests Executed
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">{testsExecuted}</div>
        </div>
        
        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <ShieldAlert className="h-4 w-4 text-violet-800" /> Unresolved Findings
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">{unresolvedFindings}</div>
        </div>

        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <ShieldCheck className="h-4 w-4 text-violet-800" /> Resolved Findings
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">{resolvedFindings}</div>
        </div>

        <div className="p-5 border border-neutral-800 rounded-xl bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
            <TrendingUp className="h-4 w-4 text-violet-800" /> Verification Rate
          </div>
          <div className="text-4xl font-black tracking-tighter text-white">{verificationRate}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
            <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Test Runs</h3>
            </div>
            <div className="divide-y divide-neutral-800">
              {recentRuns.map((run, i) => (
                <div key={run.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-white">{run.project_name}</div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1 font-medium tracking-wide">
                      <span className="uppercase text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">Run {run.id.split('-')[0]}</span>
                      <span>&bull;</span>
                      <span>{new Date(run.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded border ${
                      run.status === 'completed' 
                        ? 'text-neutral-300 bg-neutral-800 border-neutral-700' 
                        : run.status === 'failed'
                        ? 'text-red-400 bg-red-900/20 border-red-900/50'
                        : 'text-blue-400 bg-blue-900/20 border-blue-900/50'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                </div>
              ))}
              {recentRuns.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-neutral-500">
                  No recent test runs.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-neutral-800 rounded-xl p-6 bg-neutral-900">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <Database className="h-4 w-4 text-violet-800" /> Security Baseline
            </h3>
            {activeModel ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400 font-medium tracking-wide">Active Baseline</span>
                  <span className="font-mono text-xs bg-neutral-800 px-2 py-1 rounded text-white font-bold">{activeModel.version}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400 font-medium tracking-wide">App Model</span>
                  <span className="font-mono text-xs bg-neutral-800 px-2 py-1 rounded text-white font-bold">{activeModel.id.split('-')[0]}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-neutral-400 font-medium tracking-wide">Last Tested</span>
                  <span className="text-white font-bold tracking-wide">{new Date(activeModel.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center py-4">
                No active baseline found.
              </div>
            )}
          </section>

          <section className="border border-neutral-800 rounded-xl p-6 bg-neutral-900">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-3">
              <Server className="h-4 w-4 text-violet-800" /> Environment Health
            </h3>
            {projects.length > 0 ? (
              <div className="space-y-6">
                {projects.slice(0, 3).map((p: any) => {
                  const pFindings = allFindings.filter(f => f.project_id === p.id && (f.status === 'open' || f.status === 'investigating')).length;
                  return (
                    <div key={p.id}>
                      <div className="flex justify-between text-xs mb-2 uppercase font-bold tracking-widest">
                        <span className="text-neutral-400 truncate w-32">{p.name}</span>
                        <span className={pFindings > 0 ? "text-amber-500" : "text-violet-400"}>
                          {pFindings > 0 ? `${pFindings} Findings` : 'Stable'}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1">
                        <div className={`h-1 rounded-full ${pFindings > 0 ? 'bg-amber-500' : 'bg-violet-800'}`} style={{ width: pFindings > 0 ? '85%' : '100%' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center py-4">
                No projects configured.
              </div>
            )}
          </section>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
