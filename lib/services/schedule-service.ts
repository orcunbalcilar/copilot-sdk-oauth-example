/**
 * Schedule Service
 *
 * CRUD and trigger operations for scheduled test executions.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export interface ScheduledExecution {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  scenarioIds: string[];
  cronExpression: string;
  enabled: boolean;
  importToReportPortal: boolean;
  lastRunAt?: string;
  lastRunStatus?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledExecutionRun {
  id: string;
  scheduleId: string;
  startedAt: string;
  completedAt?: string;
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  scenarioIds: string[];
  cronExpression: string;
  enabled: boolean;
  importToReportPortal: boolean;
}

export type UpdateScheduleRequest = Partial<CreateScheduleRequest>;

export async function getSchedules(
  projectId: string,
): Promise<ScheduledExecution[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/schedules`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`Failed to get schedules: ${res.statusText}`);
  return res.json();
}

export async function createSchedule(
  projectId: string,
  schedule: CreateScheduleRequest,
): Promise<ScheduledExecution> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/schedules`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...schedule, projectId }),
    },
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create schedule: ${error}`);
  }
  return res.json();
}

export async function updateSchedule(
  projectId: string,
  id: string,
  updates: UpdateScheduleRequest,
): Promise<ScheduledExecution> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/schedules/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...updates, projectId }),
    },
  );
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update schedule: ${error}`);
  }
  return res.json();
}

export async function deleteSchedule(
  projectId: string,
  id: string,
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/schedules/${id}`,
    { method: "DELETE", headers: { Accept: "application/json" } },
  );
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete schedule: ${res.statusText}`);
  }
}

export async function triggerSchedule(
  projectId: string,
  id: string,
): Promise<void> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/schedules/${id}/trigger`,
    { method: "POST", headers: { Accept: "application/json" } },
  );
  if (!res.ok)
    throw new Error(`Failed to trigger schedule: ${res.statusText}`);
}

export async function getScheduleRuns(
  projectId: string,
  id: string,
): Promise<ScheduledExecutionRun[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/projects/${projectId}/schedules/${id}/runs`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok)
    throw new Error(`Failed to get schedule runs: ${res.statusText}`);
  return res.json();
}
