"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileEditIcon,
  FileIcon,
  GlobeIcon,
  MemoryStickIcon,
  PlugIcon,
  TerminalIcon,
  WrenchIcon,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { CodeBlock } from "./code-block";
import type { CopilotPermissionRequest } from "./types";

// ----- Kind display config -----

const kindConfig: Record<
  string,
  { label: string; icon: ReactNode; color: string }
> = {
  shell: {
    label: "Terminal Command",
    icon: <TerminalIcon className="size-4" />,
    color: "text-yellow-600",
  },
  write: {
    label: "Write File",
    icon: <FileEditIcon className="size-4" />,
    color: "text-orange-600",
  },
  read: {
    label: "Read File",
    icon: <FileIcon className="size-4" />,
    color: "text-blue-600",
  },
  mcp: {
    label: "MCP Tool",
    icon: <PlugIcon className="size-4" />,
    color: "text-purple-600",
  },
  url: {
    label: "Fetch URL",
    icon: <GlobeIcon className="size-4" />,
    color: "text-cyan-600",
  },
  memory: {
    label: "Store Memory",
    icon: <MemoryStickIcon className="size-4" />,
    color: "text-green-600",
  },
  "custom-tool": {
    label: "Custom Tool",
    icon: <WrenchIcon className="size-4" />,
    color: "text-muted-foreground",
  },
};

const getKindConfig = (kind: string) =>
  kindConfig[kind] ?? {
    label: "Permission",
    icon: <WrenchIcon className="size-4" />,
    color: "text-muted-foreground",
  };

// ----- Confirmation component -----

export type ConfirmationProps = HTMLAttributes<HTMLDivElement> & {
  request: CopilotPermissionRequest;
};

export function Confirmation({
  request,
  className,
  children,
  ...props
}: ConfirmationProps) {
  const config = getKindConfig(request.kind);

  return (
    <div
      className={cn("space-y-3 rounded-md border p-4", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className={config.color}>{config.icon}</span>
        <span className="text-sm font-medium">{config.label}</span>
        {request.readOnly && (
          <Badge variant="secondary" className="text-xs">
            Read-only
          </Badge>
        )}
      </div>

      {request.intention && (
        <p className="text-sm text-muted-foreground">{request.intention}</p>
      )}

      {request.kind === "shell" && request.fullCommandText && (
        <CodeBlock code={request.fullCommandText} language="bash" />
      )}

      {request.kind === "shell" &&
        request.commands &&
        request.commands.length > 0 && (
          <CodeBlock code={request.commands.join("\n")} language="bash" />
        )}

      {request.kind === "write" && request.fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileEditIcon className="size-3.5" />
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {request.fileName}
          </code>
        </div>
      )}

      {request.kind === "write" && request.diff && (
        <CodeBlock code={request.diff} language="diff" />
      )}

      {request.kind === "read" && request.path && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileIcon className="size-3.5" />
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {request.path}
          </code>
        </div>
      )}

      {request.kind === "url" && request.url && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GlobeIcon className="size-3.5" />
          <code className="truncate rounded bg-muted px-1.5 py-0.5 text-xs">
            {request.url}
          </code>
        </div>
      )}

      {request.kind === "mcp" && (
        <div className="space-y-2">
          {request.serverName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PlugIcon className="size-3.5" />
              <span>{request.serverName}</span>
              {request.toolTitle && (
                <>
                  <span className="text-muted-foreground/50">/</span>
                  <span>{request.toolTitle}</span>
                </>
              )}
            </div>
          )}
          {request.args &&
            Object.keys(request.args).length > 0 && (
              <CodeBlock
                code={JSON.stringify(request.args, null, 2)}
                language="json"
              />
            )}
        </div>
      )}

      {children}
    </div>
  );
}
