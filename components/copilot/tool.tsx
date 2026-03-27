"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import {
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldAlertIcon,
  WrenchIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

import { MessageResponse } from "./message";
import { Confirmation } from "./confirmation";
import type { CopilotToolPart, CopilotToolState } from "./types";

// ----- Status display helpers -----

const statusLabels: Record<CopilotToolState, string> = {
  "permission-requested": "Awaiting Approval",
  "permission-denied": "Denied",
  running: "Running",
  progress: "In Progress",
  completed: "Completed",
  error: "Error",
};

const statusIcons: Record<CopilotToolState, ReactNode> = {
  "permission-requested": (
    <ShieldAlertIcon className="size-4 text-yellow-600" />
  ),
  "permission-denied": <XCircleIcon className="size-4 text-orange-600" />,
  running: <ClockIcon className="size-4 animate-pulse" />,
  progress: <ClockIcon className="size-4 animate-pulse" />,
  completed: <CheckCircleIcon className="size-4 text-green-600" />,
  error: <XCircleIcon className="size-4 text-red-600" />,
};

export const getStatusBadge = (state: CopilotToolState) => (
  <Badge className="gap-1.5 rounded-full text-xs" variant="secondary" data-tool-state={state}>
    {statusIcons[state]}
    {statusLabels[state]}
  </Badge>
);

// ----- Tool approval buttons -----

function ToolApprovalButtons({
  toolCallId,
}: Readonly<{ toolCallId: string }>) {
  const [responding, setResponding] = useState(false);
  const [decision, setDecision] = useState<"approved" | "denied" | null>(null);

  const respond = (approved: boolean) => {
    setResponding(true);
    setDecision(approved ? "approved" : "denied");
    fetch("/api/chat/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolCallId, approved }),
    }).catch(() => {
      setResponding(false);
      setDecision(null);
    });
  };

  if (decision) {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs">
        {decision === "approved" ? (
          <CheckIcon className="size-3 text-green-600" />
        ) : (
          <XIcon className="size-3 text-red-600" />
        )}
        {decision === "approved" ? "Approved" : "Denied"}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        size="sm"
        variant="default"
        disabled={responding}
        onClick={() => respond(true)}
        className="gap-1.5"
      >
        <CheckIcon className="size-3.5" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={responding}
        onClick={() => respond(false)}
        className="gap-1.5"
      >
        <XIcon className="size-3.5" />
        Deny
      </Button>
    </div>
  );
}

// ----- Main Tool component -----

export type ToolDisplayProps = Omit<
  ComponentProps<typeof Collapsible>,
  "part"
> & {
  part: CopilotToolPart;
};

export function ToolDisplay({
  part,
  className,
  ...props
}: ToolDisplayProps) {
  const { toolCallId, toolName, state, arguments: args } = part;
  const isOpen = state !== "completed";

  return (
    <Collapsible
      className={cn(
        "group not-prose mb-4 w-full rounded-md border",
        className,
      )}
      defaultOpen={isOpen}
      {...props}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-2">
          <WrenchIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{toolName}</span>
          {getStatusBadge(state)}
        </div>
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 p-4 text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
        {args != null && (
          <div className="space-y-2 overflow-hidden">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Parameters
            </h4>
            <div className="rounded-md bg-muted/50">
              <CodeBlock
                code={JSON.stringify(args, null, 2)}
                language="json"
              />
            </div>
          </div>
        )}

        {part.progressMessage && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
            <span className="inline-block size-2 rounded-full bg-blue-500" />
            <span>{part.progressMessage}</span>
          </div>
        )}

        {state === "permission-requested" && part.permissionRequest && (
          <Confirmation request={part.permissionRequest}>
            <ToolApprovalButtons toolCallId={toolCallId} />
          </Confirmation>
        )}

        {state === "permission-requested" && !part.permissionRequest && (
          <ToolApprovalButtons toolCallId={toolCallId} />
        )}

        {state === "completed" && part.output && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Result
            </h4>
            <div className="overflow-x-auto rounded-md bg-muted/50 text-xs text-foreground">
              <MessageResponse>{String(part.output)}</MessageResponse>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Error
            </h4>
            <div className="overflow-x-auto rounded-md bg-destructive/10 text-xs text-destructive">
              {part.error ?? "Unknown error"}
            </div>
          </div>
        )}

        {state === "permission-denied" && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Error
            </h4>
            <div className="overflow-x-auto rounded-md bg-destructive/10 text-xs text-destructive">
              Tool execution was denied by user
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
