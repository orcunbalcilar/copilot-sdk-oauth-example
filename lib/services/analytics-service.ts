/**
 * Analytics Service
 *
 * Aggregated analytics across projects and scenarios.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export interface AnalyticsSummary {
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  successRate: number;
}

export interface UserAnalytics {
  userId: string;
  totalScenarios: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const projectsRes = await fetch(
      `${BACKEND_URL}/api/projects?page=0&size=100`,
      { headers: { Accept: "application/json" } },
    );
    if (!projectsRes.ok)
      throw new Error(`Failed to get projects: ${projectsRes.statusText}`);

    const data = await projectsRes.json();
    const projects = Array.isArray(data) ? data : data.content ?? [];

    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;

    for (const project of projects) {
      try {
        const statsRes = await fetch(
          `${BACKEND_URL}/api/scenarios/statistics?projectId=${project.id}`,
          { headers: { Accept: "application/json" } },
        );
        if (statsRes.ok) {
          const stats = await statsRes.json();
          totalScenarios += stats.total ?? 0;
          passedScenarios += stats.validated ?? 0;
          failedScenarios += stats.failed ?? 0;
        }
      } catch (err) {
        console.warn(
          `[AnalyticsService] Error fetching stats for project ${project.id}:`,
          err,
        );
      }
    }

    const totalExecuted = passedScenarios + failedScenarios;
    const successRate =
      totalExecuted > 0 ? (passedScenarios / totalExecuted) * 100 : 0;

    return { totalScenarios, passedScenarios, failedScenarios, successRate };
  } catch (error) {
    console.error("[AnalyticsService] Error fetching summary:", error);
    return {
      totalScenarios: 0,
      passedScenarios: 0,
      failedScenarios: 0,
      successRate: 0,
    };
  }
}

export async function getUserAnalytics(
  userId: string,
): Promise<UserAnalytics> {
  const res = await fetch(
    `${BACKEND_URL}/api/analytics/user/${encodeURIComponent(userId)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok)
    throw new Error(`Failed to get user analytics: ${res.statusText}`);
  return res.json();
}
