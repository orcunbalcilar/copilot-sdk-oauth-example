/**
 * Backend URL configuration.
 *
 * Client-side: returns empty string (relative URLs via Next.js rewrites).
 * Server-side: returns full backend URL for direct communication.
 */
export function getBackendUrl(): string {
  if (globalThis.window !== undefined) return "";
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
}

export function getMcpServerUrl(): string {
  return process.env.MCP_SERVER_URL || "http://localhost:8090/mcp";
}
