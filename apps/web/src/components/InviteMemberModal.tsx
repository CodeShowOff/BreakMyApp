"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { inviteMemberAction } from "@/app/actions";
import { useRouter } from "next/navigation";

export function InviteMemberModal({ organizationId }: { organizationId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError("");

    const result = await inviteMemberAction(organizationId, email, role);
    
    if (result.success) {
      setIsOpen(false);
      setEmail("");
      setRole("MEMBER");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-violet-800 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-violet-900 transition-colors flex items-center gap-2"
      >
        <Plus className="h-4 w-4" /> Invite Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-black tracking-widest uppercase text-white">Invite Team Member</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@acmecorp.com" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-800 focus:border-violet-800 transition-shadow"
                  autoFocus
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold tracking-widest uppercase text-neutral-400 mb-2">
                  Role
                </label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-violet-800 focus:border-violet-800 transition-shadow appearance-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              {error && (
                <div className="mb-4 text-xs font-bold text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-900/50">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="bg-violet-800 text-white px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-violet-900 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
