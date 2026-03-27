"use client";

import { Shimmer } from "./shimmer";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type IntentProps = HTMLAttributes<HTMLDivElement> & {
  intent: string;
};

export function Intent({ intent, className, ...props }: IntentProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground animate-pulse",
        className,
      )}
      {...props}
    >
      <Spinner className="size-3" />
      <Shimmer duration={1}>{intent}</Shimmer>
    </div>
  );
}
