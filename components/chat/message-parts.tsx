"use client";

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UIMessage, DynamicToolUIPart, ToolUIPart } from "ai";
import type { ChatStatus } from "./types";
import {
  CheckIcon,
  XIcon,
  CpuIcon,
  ZapIcon,
  DatabaseIcon,
} from "lucide-react";
import { useState } from "react";

type Part = UIMessage["parts"][number];

type AnyToolPart = (ToolUIPart | DynamicToolUIPart) & {
  toolCallId: string;
  state: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function isToolPart(part: Part): part is AnyToolPart {
  return (
    part.type === "dynamic-tool" ||
    (part.type.startsWith("tool-") && part.type !== "tool-approval-request")
  );
}

function getToolName(part: AnyToolPart): string {
  if (part.type === "dynamic-tool") {
    return (part as DynamicToolUIPart).toolName ?? "tool";
  }
  return part.type.replace(/^tool-/, "");
}

function ToolApprovalButtons({
  toolCallId,
}: Readonly<{ toolCallId: string }>) {
  const [responding, setResponding] = useState(false);
  const [decision, setDecision] = useState<"approved" | "denied" | null>(null);

  const respond = async (approved: boolean) => {
    setResponding(true);
    setDecision(approved ? "approved" : "denied");
    try {
      await fetch("/api/chat/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolCallId, approved }),
      });
    } catch {
      setResponding(false);
      setDecision(null);
    }
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

function ToolPart({ part }: Readonly<{ part: AnyToolPart }>) {
  const toolName = getToolName(part);
  const state = part.state;

  return (
    <Tool defaultOpen={state !== "output-available"}>
      <ToolHeader
        type="dynamic-tool"
        toolName={toolName}
        state={state}
      />
      <ToolContent>
        {part.input != null && (
          <ToolInput input={part.input as Record<string, unknown>} />
        )}
        {state === "approval-requested" && (
          <ToolApprovalButtons toolCallId={part.toolCallId} />
        )}
        {state === "output-available" && (
          <ToolOutput
            output={
              <MessageResponse>
                {String(part.output ?? "")}
              </MessageResponse>
            }
            errorText={undefined}
          />
        )}
        {state === "output-error" && (
          <ToolOutput
            output={undefined}
            errorText={part.errorText ?? "Unknown error"}
          />
        )}
        {state === "output-denied" && (
          <ToolOutput
            output={undefined}
            errorText="Tool execution was denied by user"
          />
        )}
      </ToolContent>
    </Tool>
  );
}

function UsagePart({ data }: Readonly<{ data: Record<string, unknown> }>) {
  const model = data.model as string | undefined;
  const inputTokens = data.inputTokens as number | undefined;
  const outputTokens = data.outputTokens as number | undefined;
  const cacheReadTokens = data.cacheReadTokens as number | undefined;
  const duration = data.duration as number | undefined;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <CpuIcon className="size-3" />
      {model && <span className="font-medium">{model}</span>}
      {inputTokens != null && <span>{inputTokens.toLocaleString()} in</span>}
      {outputTokens != null && <span>{outputTokens.toLocaleString()} out</span>}
      {cacheReadTokens != null && cacheReadTokens > 0 && (
        <span className="flex items-center gap-1">
          <DatabaseIcon className="size-3" />
          {cacheReadTokens.toLocaleString()} cached
        </span>
      )}
      {duration != null && <span>{(duration / 1000).toFixed(1)}s</span>}
    </div>
  );
}

function ContextUsagePart({ data }: Readonly<{ data: Record<string, unknown> }>) {
  const tokenLimit = data.tokenLimit as number | undefined;
  const currentTokens = data.currentTokens as number | undefined;
  const messagesLength = data.messagesLength as number | undefined;

  if (tokenLimit == null || currentTokens == null) return null;

  const pct = Math.min((currentTokens / tokenLimit) * 100, 100);

  let color = "bg-green-500";
  if (pct > 80) color = "bg-red-500";
  else if (pct > 60) color = "bg-yellow-500";

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <DatabaseIcon className="size-3" />
      <span>Context:</span>
      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          /* dynamic width needs inline style */
          style={{ width: `${pct}%` }} // eslint-disable-line react/forbid-dom-props
        />
      </div>
      <span>
        {currentTokens.toLocaleString()} / {tokenLimit.toLocaleString()}
      </span>
      {messagesLength != null && (
        <span className="text-muted-foreground/60">({messagesLength} msgs)</span>
      )}
    </div>
  );
}

function ToolProgressPart({ data }: Readonly<{ data: Record<string, unknown> }>) {
  const progressMessage = data.progressMessage as string | undefined;
  if (!progressMessage) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
      <span className="inline-block size-2 rounded-full bg-blue-500" />
      <span>{progressMessage}</span>
    </div>
  );
}

function DataPart({ part, keyProp }: Readonly<{ part: Part; keyProp: string }>) {
  const dataType = part.type.replace(/^data-/, "");
  const data = (part as { data: Record<string, unknown> }).data;
  if (dataType === "usage" && data) {
    return <UsagePart key={keyProp} data={data} />;
  }
  if (dataType === "context-usage" && data) {
    return <ContextUsagePart key={keyProp} data={data} />;
  }
  if (dataType === "tool-progress" && data) {
    return <ToolProgressPart key={keyProp} data={data} />;
  }
  if (dataType === "permission" && data) {
    return (
      <div key={keyProp} className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ZapIcon className="size-3" />
        <span>Permission: {String(data.result)}</span>
      </div>
    );
  }
  return null;
}

function renderPart(
  part: Part,
  key: string,
  isReasoningStreaming: boolean,
) {
  if (isToolPart(part)) {
    return <ToolPart key={key} part={part} />;
  }
  switch (part.type) {
    case "reasoning":
      return (
        <Reasoning className="w-full" isStreaming={isReasoningStreaming} key={key}>
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      );
    case "text":
      return <MessageResponse key={key}>{part.text}</MessageResponse>;
    default:
      if (part.type.startsWith("data-")) {
        return <DataPart key={key} part={part} keyProp={key} />;
      }
      return null;
  }
}

export function MessageParts({
  message,
  isLastMessage,
  status,
}: Readonly<{
  message: UIMessage;
  isLastMessage: boolean;
  status: ChatStatus;
}>) {
  const isStreaming = status === "streaming";
  const lastPart = message.parts.at(-1);
  const isReasoningStreaming =
    isLastMessage && isStreaming && lastPart?.type === "reasoning";

  return (
    <>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        return renderPart(part, key, isReasoningStreaming);
      })}
    </>
  );
}
