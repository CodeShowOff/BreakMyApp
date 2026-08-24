import { auth } from '@clerk/nextjs/server';
import { MoreVertical } from "lucide-react";
import { getOrganizations, getOrganizationMembers } from "@/lib/api";
import { InviteMemberModal } from "@/components/InviteMemberModal";

export default async function TeamSettings() {
  await auth.protect();
  
  let orgs = [];
  let members = [];
  try {
    orgs = await getOrganizations();
    if (orgs.length > 0) {
      members = await getOrganizationMembers(orgs[0].id);
    }
  } catch (error) {
    console.error("Failed to load members", error);
  }

  return (
    <div className="max-w-4xl font-sans">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black tracking-tighter uppercase text-white">Team Members</h2>
          <p className="text-sm font-bold tracking-widest uppercase text-neutral-500 mt-1">Manage users and roles (Owner, Admin, Member, Viewer).</p>
        </div>
        {orgs.length > 0 && <InviteMemberModal organizationId={orgs[0].id} />}
      </header>

      <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950">
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-neutral-500">User</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-neutral-500">Role</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-neutral-500">Joined</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-neutral-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 text-sm">
            {members.map((member: any) => (
              <tr key={member.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-white">{member.email || "Unknown User"}</div>
                  <div className="text-xs font-medium tracking-wide text-neutral-500">{member.user_id}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded border ${
                    member.role === 'OWNER' 
                      ? 'text-blue-400 bg-blue-900/20 border-blue-900/50' 
                      : 'text-neutral-400 bg-neutral-800 border-neutral-700'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-4 px-6 text-neutral-500 font-medium tracking-wide">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-neutral-500 hover:text-white p-1.5 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm font-bold tracking-widest uppercase text-neutral-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
