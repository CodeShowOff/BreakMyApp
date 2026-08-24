import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { getToken } = await auth();
  const token = await getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getOrganizations() {
  return fetchWithAuth('/organizations');
}

export async function getProjects(organizationId: string) {
  return fetchWithAuth(`/projects?organization_id=${organizationId}`);
}

export async function getProject(projectId: string) {
  return fetchWithAuth(`/projects/${projectId}`);
}

export async function getFindings(projectId: string) {
  return fetchWithAuth(`/projects/${projectId}/findings`);
}

export async function getFinding(projectId: string, findingId: string) {
  return fetchWithAuth(`/projects/${projectId}/findings/${findingId}`);
}

export async function getTestRuns(projectId: string) {
  return fetchWithAuth(`/projects/${projectId}/test-runs`);
}

export async function getTestRun(projectId: string, runId: string) {
  return fetchWithAuth(`/projects/${projectId}/test-runs/${runId}`);
}

export async function getBusinessRules(projectId: string) {
  return fetchWithAuth(`/projects/${projectId}/business-rules`);
}

export async function getApplicationModels(projectId: string) {
  return fetchWithAuth(`/projects/${projectId}/application-model`);
}

export async function createProject(organizationId: string, name: string) {
  return fetchWithAuth('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, organization_id: organizationId }),
  });
}

export async function createOrganization(name: string) {
  return fetchWithAuth('/organizations', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getOrganizationMembers(organizationId: string) {
  return fetchWithAuth(`/organizations/${organizationId}/members`);
}

export async function inviteOrganizationMember(organizationId: string, email: string, role: string) {
  return fetchWithAuth(`/organizations/${organizationId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}
