import { auth } from '@clerk/nextjs/server';
import { Save } from "lucide-react";
import { getOrganizations } from "@/lib/api";

export default async function Settings() {
  await auth.protect();
  
  let orgName = "";
  try {
    const orgs = await getOrganizations();
    if (orgs.length > 0) {
      orgName = orgs[0].name;
    }
  } catch (error) {
    console.error("Failed to fetch organization settings", error);
  }

  return (
    <div className="max-w-4xl font-sans">
      <header className="mb-6">
        <h2 className="text-xl font-black tracking-tighter uppercase text-white">General Settings</h2>
        <p className="text-sm font-bold tracking-widest uppercase text-neutral-500 mt-1">Manage your organization profile and global preferences.</p>
      </header>

      <div className="space-y-6">
        <section className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
          <div className="bg-neutral-950 px-6 py-4 border-b border-neutral-800">
            <h3 className="text-sm font-black tracking-widest uppercase text-white">Organization Profile</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">Organization Name</label>
              <input type="text" defaultValue={orgName} disabled className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm font-bold text-neutral-500 focus:outline-none transition-shadow cursor-not-allowed" />
              <p className="text-xs text-neutral-500 mt-2">Organization names cannot be changed currently.</p>
            </div>
            {/* Disabled save button since there's no PUT /organizations endpoint implemented currently */}
            <div className="pt-4 border-t border-neutral-800">
              <button disabled className="bg-neutral-800 text-neutral-500 px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase cursor-not-allowed flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

