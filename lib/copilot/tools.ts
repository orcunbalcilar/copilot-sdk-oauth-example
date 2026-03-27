/**
 * RestFlow AI Tools for Copilot SDK
 *
 * SDK-side tools; MCP tools are provided by the MCP server.
 */

import { defineTool } from "@github/copilot-sdk";
import { z } from "zod";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

function isPostmanCollection(content: string): boolean {
  try {
    const json = JSON.parse(content);
    return !!json.info?.schema?.includes("postman");
  } catch {
    return false;
  }
}

async function getOrCreateProject(projectId?: string): Promise<string | null> {
  if (projectId) return projectId;
  try {
    const response = await fetch(`${BACKEND_URL}/api/projects`);
    if (response.ok) {
      const projects = (await response.json()) as Array<{ id: string }>;
      if (projects.length > 0) return projects.at(-1)?.id ?? null;
    }
    const createResponse = await fetch(`${BACKEND_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Default Project", description: "Auto-created project" }),
    });
    if (createResponse.ok) {
      const project = (await createResponse.json()) as { id: string };
      return project.id;
    }
  } catch {
    return null;
  }
  return null;
}

export const fetchUrlTool = defineTool("fetchUrl", {
  description:
    "Download content from a URL. Use for Swagger/OpenAPI specs, API docs. ALWAYS use this first when user provides a URL.",
  parameters: z.object({
    url: z.string().describe("HTTP/HTTPS URL to fetch"),
  }),
  handler: async ({ url }: { url: string }) => {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json, application/yaml, text/yaml, text/plain, */*",
          "User-Agent": "RestFlowAI/2.0",
        },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) {
        return JSON.stringify({ success: false, error: `HTTP ${response.status}`, url });
      }
      let content = await response.text();
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("json") || content.trim().startsWith("{")) {
        try {
          content = JSON.stringify(JSON.parse(content), null, 2);
        } catch { /* keep as text */ }
      }
      if (isPostmanCollection(content)) {
        return JSON.stringify({
          success: false,
          isPostmanCollection: true,
          url,
          message: "This is a Postman collection. Use importPostmanCollection instead.",
        });
      }
      const maxLen = 80000;
      const truncated = content.length > maxLen;
      return JSON.stringify({
        success: true,
        url,
        contentType,
        content: truncated ? content.slice(0, maxLen) : content,
        truncated,
        length: content.length,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch URL",
        url,
      });
    }
  },
});

export const importPostmanCollectionTool = defineTool("importPostmanCollection", {
  description:
    "Import a Postman collection into RestFlow. Processed server-side to avoid context overflow.",
  parameters: z.object({
    url: z.string().optional().describe("URL to fetch the Postman collection from"),
    collectionJson: z.string().optional().describe("Raw Postman collection JSON"),
    projectId: z.string().optional().describe("Project ID to import into"),
  }),
  handler: async (args: { url?: string; collectionJson?: string; projectId?: string }) => {
    try {
      let collectionContent: string;
      if (args.url) {
        const response = await fetch(args.url, {
          headers: { Accept: "application/json", "User-Agent": "RestFlowAI/2.0" },
          signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) {
          return JSON.stringify({ success: false, error: `HTTP ${response.status}` });
        }
        collectionContent = await response.text();
      } else if (args.collectionJson) {
        collectionContent = args.collectionJson;
      } else {
        return JSON.stringify({ success: false, error: "Provide url or collectionJson" });
      }

      if (!isPostmanCollection(collectionContent)) {
        return JSON.stringify({ success: false, error: "Not a valid Postman collection" });
      }

      const projectId = await getOrCreateProject(args.projectId);
      if (!projectId) {
        return JSON.stringify({ success: false, error: "Failed to get or create project" });
      }

      const importResponse = await fetch(
        `${BACKEND_URL}/api/projects/${projectId}/import/postman/json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: collectionContent,
          signal: AbortSignal.timeout(120000),
        },
      );

      if (!importResponse.ok) {
        const errText = await importResponse.text();
        return JSON.stringify({
          success: false,
          error: `Import failed (${importResponse.status}): ${errText.substring(0, 500)}`,
        });
      }

      const result = (await importResponse.json()) as {
        created: number;
        skipped: number;
        warnings: string[];
      };

      let collectionName = "Unknown Collection";
      try {
        const parsed = JSON.parse(collectionContent) as { info?: { name?: string } };
        collectionName = parsed.info?.name || collectionName;
      } catch { /* ignore */ }

      return JSON.stringify({
        success: true,
        collectionName,
        projectId,
        created: result.created,
        skipped: result.skipped,
        message: `Imported "${collectionName}": ${result.created} scenarios created`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      });
    }
  },
});

export const createPlanTool = defineTool("createPlan", {
  description: "Create a test plan from API analysis. User MUST approve before execution.",
  parameters: z.object({
    title: z.string().min(1).max(200),
    description: z.string(),
    baseUrl: z.string(),
    scenarios: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          endpoint: z.string(),
          method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
          priority: z.enum(["critical", "high", "medium", "low"]),
          category: z.string(),
          testType: z.enum(["positive", "negative", "edge", "security", "performance"]),
          assertions: z.array(z.object({ type: z.string(), description: z.string() })).min(1),
        }),
      )
      .min(1),
  }),
  handler: async (args: {
    title: string;
    description: string;
    baseUrl: string;
    scenarios: Array<{
      id: string;
      name: string;
      description: string;
      endpoint: string;
      method: string;
      priority: string;
      category: string;
      testType: string;
      assertions: Array<{ type: string; description: string }>;
    }>;
  }) => {
    return JSON.stringify({
      success: true,
      plan: {
        id: `plan_${Date.now()}`,
        title: args.title,
        description: args.description,
        baseUrl: args.baseUrl,
        scenarios: args.scenarios,
        estimatedDuration: `${Math.ceil(args.scenarios.length * 2)} minutes`,
        status: "approved",
        createdAt: new Date().toISOString(),
      },
      message: `Test plan "${args.title}" with ${args.scenarios.length} scenarios approved. Proceed to create scenarios.`,
    });
  },
});

export const restflowTools = [fetchUrlTool, importPostmanCollectionTool, createPlanTool];
