"use server";

import { revalidatePath } from "next/cache";
import { createProject as apiCreateProject, inviteOrganizationMember as apiInviteMember, createOrganization as apiCreateOrganization } from "@/lib/api";

export async function createProjectAction(organizationId: string | null, name: string) {
  try {
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const newOrg = await apiCreateOrganization("My Organization");
      targetOrgId = newOrg.id;
    }
    
    if (!targetOrgId) {
      throw new Error("Failed to resolve organization");
    }

    const project = await apiCreateProject(targetOrgId, name);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, project };
  } catch (error: any) {
    console.error("Failed to create project", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function inviteMemberAction(organizationId: string, email: string, role: string) {
  try {
    const member = await apiInviteMember(organizationId, email, role);
    revalidatePath("/settings/team");
    return { success: true, member };
  } catch (error: any) {
    console.error("Failed to invite member", error);
    return { success: false, error: error.message || "Failed to invite member" };
  }
}
