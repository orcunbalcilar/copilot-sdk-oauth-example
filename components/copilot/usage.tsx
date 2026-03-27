"use client";

import { cn } from "@/lib/utils";
import { CpuIcon, DatabaseIcon } from "lucide-react";
import type { HTMLAttributes } from "react";

import type { AssistantUsageData } from "./types";

export type UsageDisplayProps = HTMLAttributes<HTMLDivElement> & {
  usage: AssistantUsageData;
};

export function UsageDisplay({
  usage,
  className,
  ...props
}: UsageDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    >
      <CpuIcon className="size-3" />
      {usage.model && <span className="font-medium">{usage.model}</span>}
      {usage.inputTokens != null && (
        <span>{usage.inputTokens.toLocaleString()} in</span>
      )}
      {usage.outputTokens != null && (
        <span>{usage.outputTokens.toLocaleString()} out</span>
      )}
      {usage.cacheReadTokens != null && usage.cacheReadTokens > 0 && (
        <span className="flex items-center gap-1">
          <DatabaseIcon className="size-3" />
          {usage.cacheReadTokens.toLocaleString()} cached
        </span>
      )}
      {usage.duration != null && (
        <span>{(usage.duration / 1000).toFixed(1)}s</span>
      )}
    </div>
  );
}
