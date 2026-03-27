import type { CopilotPart, CopilotToolPart, CopilotPermissionRequest } from "@/components/copilot/types";

const kindNames: Record<string, string> = {
  bash: "Run Command",
  edit: "Edit File",
  insert: "Create File",
  "create-directory": "Create Directory",
  url: "Fetch URL",
  memory: "Store Memory",
};

export function getPermissionToolName(req: CopilotPermissionRequest): string {
  const staticName = kindNames[req.kind];
  if (staticName) return staticName;
  if (req.kind === "write") return `Write: ${req.fileName ?? "file"}`;
  if (req.kind === "read") return `Read: ${req.path ?? "file"}`;
  if (req.kind === "mcp") return req.toolTitle ?? req.toolName ?? "MCP Tool";
  if (req.kind === "custom-tool") return req.toolName ?? "Custom Tool";
  return "Permission";
}

export function findOrCreateToolPart(
  parts: CopilotPart[],
  toolCallId: string,
  defaults: Partial<CopilotToolPart> = {},
): CopilotPart[] {
  const exists = parts.some(
    (p) => p.type === "tool" && p.toolCallId === toolCallId,
  );
  if (exists) return parts;
  return [
    ...parts,
    {
      type: "tool" as const,
      toolCallId,
      toolName: defaults.toolName ?? "tool",
      state: defaults.state ?? "running",
      arguments: defaults.arguments,
      permissionRequest: defaults.permissionRequest,
    },
  ];
}

export function updateToolPart(
  parts: CopilotPart[],
  toolCallId: string,
  update: Partial<CopilotToolPart>,
): CopilotPart[] {
  return parts.map((p) => {
    if (p.type === "tool" && p.toolCallId === toolCallId) {
      return { ...p, ...update };
    }
    return p;
  });
}
