/**
 * Scenario Service
 *
 * CRUD and execution operations for test scenarios.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export interface StoredScenario {
  id: string;
  name: string;
  projectId: string;
  yamlContent: string;
  status: "CREATED" | "VALIDATED" | "FAILED" | "RUNNING";
  createdAt: string;
  updatedAt: string;
  lastExecutionAt?: string;
  lastExecutionStatus?: string;
  version?: number;
}

export interface ExecutionResult {
  id: string;
  scenarioId: string;
  status: "PASSED" | "FAILED" | "ERROR";
  startedAt: string;
  completedAt?: string;
  steps: StepResult[];
  errorMessage?: string;
}

export interface StepResult {
  stepIndex: number;
  status: "PASSED" | "FAILED" | "ERROR" | "SKIPPED";
  responseStatus?: number;
  responseBody?: string;
  assertions: AssertionResult[];
  errorMessage?: string;
}

export interface AssertionResult {
  type: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface ScenarioStatistics {
  total: number;
  validated: number;
  failed: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
}

export async function getProjectScenarios(
  projectId: string,
  page = 0,
  size = 100,
): Promise<{ content: StoredScenario[]; totalElements: number }> {
  const res = await fetch(
    `${BACKEND_URL}/api/scenarios?projectId=${projectId}&page=${page}&size=${size}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok)
    throw new Error(`Failed to get scenarios: ${res.statusText}`);

  const data = await res.json();
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length };
  }
  return {
    content: data.content ?? [],
    totalElements: data.totalElements ?? 0,
  };
}

export async function deleteScenario(id: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/scenarios/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete scenario: ${res.statusText}`);
  }
}

export async function runScenario(id: string): Promise<ExecutionResult> {
  const res = await fetch(`${BACKEND_URL}/api/scenarios/${id}/execute`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to run scenario: ${res.statusText}`);
  return res.json();
}

export async function getScenarioStats(
  projectId: string,
): Promise<ScenarioStatistics> {
  const res = await fetch(
    `${BACKEND_URL}/api/scenarios/statistics?projectId=${projectId}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok)
    throw new Error(`Failed to get scenario stats: ${res.statusText}`);
  return res.json();
}
