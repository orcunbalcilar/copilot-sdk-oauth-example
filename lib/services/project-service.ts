/**
 * Project Service
 *
 * CRUD operations for projects via the RestFlow backend API.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export interface Project {
  id: string;
  name: string;
  description?: string;
  baseUrl?: string;
  defaultHeadersJson?: string;
  tags?: string[];
  testCount: number;
  lastRunPassedCount: number;
  lastRunFailedCount: number;
  lastRunAt?: string;
  createdAt: string;
  updatedAt: string;
  reportPortalApiKey?: string;
  reportPortalProjectName?: string;
  reportPortalEnabled?: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  baseUrl?: string;
  defaultHeadersJson?: string;
  tags?: string[];
}

export async function listProjects(
  page = 0,
  size = 20,
): Promise<{ content: Project[]; totalElements: number }> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects?page=${page}&size=${size}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`Failed to list projects: ${res.statusText}`);

  const data = await res.json();
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length };
  }
  const content = Array.isArray(data.content) ? data.content : [];
  const totalElements =
    typeof data.totalElements === "number"
      ? data.totalElements
      : content.length;
  return { content, totalElements };
}

export async function createProject(
  request: CreateProjectRequest,
): Promise<Project> {
  const res = await fetch(`${BACKEND_URL}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create project: ${error}`);
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete project: ${res.statusText}`);
  }
}

export async function deleteAllProjects(): Promise<number> {
  const { content: projects } = await listProjects(0, 1000);
  let count = 0;
  for (const p of projects) {
    await deleteProject(p.id);
    count++;
  }
  return count;
}

export async function updateProject(
  id: string,
  updates: Partial<CreateProjectRequest> &
    Partial<
      Pick<
        Project,
        | "reportPortalApiKey"
        | "reportPortalProjectName"
        | "reportPortalEnabled"
      >
    >,
): Promise<Project> {
  const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update project: ${res.statusText}`);
  return res.json();
}

export async function testReportPortalConnection(
  projectId: string,
): Promise<boolean> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/report-portal/test`,
    { method: "POST", headers: { Accept: "application/json" } },
  );
  return res.ok;
}

/**
 * Get the best candidate project (first one with scenarios, or first overall).
 */
export async function getOrCreateDefaultProject(): Promise<Project> {
  const { content: projects } = await listProjects(0, 100);
  if (projects.length === 0) {
    throw new Error("No projects found. Please create a project first.");
  }
  return projects[0];
}
