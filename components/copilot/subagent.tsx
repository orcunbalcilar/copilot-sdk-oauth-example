"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  BotIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

import type { CopilotSubagentPart } from "./types";

export type SubagentState = CopilotSubagentPart["state"];

const stateLabels: Record<SubagentState, string> = {
  running: "Running",
  completed: "Completed",
  error: "Failed",
};

const stateIcons: Record<SubagentState, React.ReactNode> = {
  running: <Loader2Icon className="size-4 animate-spin" />,
  completed: <CheckCircleIcon className="size-4 text-green-600" />,
  error: <XCircleIcon className="size-4 text-red-600" />,
};

export type SubagentDisplayProps = Omit<
  ComponentProps<typeof Collapsible>,
  "part"
> & {
  part: CopilotSubagentPart;
};

export function SubagentDisplay({
  part,
  className,
  ...props
}: SubagentDisplayProps) {
  const { agentDisplayName, agentDescription, state, error } = part;

  return (
    <Collapsible
      className={cn(
        "group not-prose mb-4 w-full rounded-md border",
        className,
      )}
      defaultOpen={state !== "completed"}
      {...props}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-2">
          <BotIcon className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{agentDisplayName}</span>
          <Badge className="gap-1.5 rounded-full text-xs" variant="secondary">
            {stateIcons[state]}
            {stateLabels[state]}
          </Badge>
        </div>
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 p-4 text-popover-foreground">
        {agentDescription && (
          <p className="text-xs text-muted-foreground">{agentDescription}</p>
        )}

        {state === "error" && error && (
          <div className="overflow-x-auto rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
