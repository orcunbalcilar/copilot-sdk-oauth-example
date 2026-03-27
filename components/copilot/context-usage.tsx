"use client";

import { cn } from "@/lib/utils";
import { DatabaseIcon } from "lucide-react";
import type { HTMLAttributes } from "react";

import type { SessionUsageInfoData } from "./types";

function contextUsageColor(pct: number): string {
  if (pct > 80) return "bg-red-500";
  if (pct > 60) return "bg-yellow-500";
  return "bg-green-500";
}

export type ContextUsageProps = HTMLAttributes<HTMLDivElement> & {
  usage: SessionUsageInfoData;
};

export function ContextUsage({
  usage,
  className,
  ...props
}: ContextUsageProps) {
  const pct = Math.min(
    (usage.currentTokens / usage.tokenLimit) * 100,
    100,
  );

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    >
      <DatabaseIcon className="size-3" />
      <span>Context:</span>
      <div className="h-1.5 max-w-30 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${contextUsageColor(pct)}`}
          style={{ width: `${pct}%` }} // dynamic width requires inline style
        />
      </div>
      <span>
        {usage.currentTokens.toLocaleString()} /{" "}
        {usage.tokenLimit.toLocaleString()}
      </span>
      <span className="text-muted-foreground/60">
        ({usage.messagesLength} msgs)
      </span>
    </div>
  );
}
