import { auth } from '@clerk/nextjs/server';
import Link from "next/link";
import { FolderKanban, Plus, Search, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { getOrganizations, getProjects } from "@/lib/api";
import { CreateProjectModal } from "@/components/CreateProjectModal";

export default async function Projects() {
  await auth.protect();
  
  let projects: any[] = [];
  let orgs: any[] = [];
  try {
    orgs = await getOrganizations();
    if (orgs.length > 0) {
      projects = await getProjects(orgs[0].id);
    }
  } catch (error) {
    console.error("Failed to fetch projects", error);
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-neutral-950 text-white font-sans">
      <header className="mb-8 border-b border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Projects</h1>
          <p className="text-sm text-neutral-500 font-bold tracking-widest uppercase mt-2">Manage your application targets and testing scopes.</p>
        </div>
        <CreateProjectModal organizationId={orgs.length > 0 ? orgs[0].id : null} />
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
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="group block">
            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 hover:border-violet-800 transition-colors h-full flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-black tracking-tighter uppercase text-white group-hover:text-violet-400 transition-colors flex items-center gap-3">
                  <FolderKanban className="h-4 w-4 text-violet-800" />
                  {project.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-900/20 px-2 py-1 rounded border border-violet-800/50">
                  Active
                </span>
              </div>
              
              <p className="text-neutral-400 text-sm mb-6 line-clamp-2 flex-1 font-medium leading-relaxed">
                Project target for continuous adversarial testing.
              </p>
              
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-neutral-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> {(new Date(project.created_at)).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-violet-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Ready
                </div>
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500 font-bold uppercase tracking-widest border border-dashed border-neutral-800 rounded-xl">
            No projects found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
