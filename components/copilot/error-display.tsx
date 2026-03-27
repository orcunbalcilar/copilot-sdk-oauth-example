"use client";

import { cn } from "@/lib/utils";
import { AlertCircleIcon } from "lucide-react";
import type { HTMLAttributes } from "react";

import type { SessionErrorData } from "./types";

export type ErrorDisplayProps = HTMLAttributes<HTMLDivElement> & {
  error: SessionErrorData;
};

export function ErrorDisplay({
  error,
  className,
  ...props
}: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive",
        className,
      )}
      role="alert"
      {...props}
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">
          {error.errorType}
          {error.statusCode ? ` (${error.statusCode})` : ""}
        </p>
        <p className="text-xs">{error.message}</p>
      </div>
    </div>
  );
}
