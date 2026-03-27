"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CopilotChatStatus,
  CopilotEventEnvelope,
  CopilotMessage,
  CopilotPart,
  CopilotToolPart,
  AssistantIntentData,
  AssistantReasoningDeltaData,
  AssistantMessageDeltaData,
  AssistantUsageData,
  ToolExecutionStartData,
  ToolExecutionProgressData,
  ToolExecutionPartialResultData,
  ToolExecutionCompleteData,
  PermissionRequestedData,
  PermissionCompletedData,
  SessionErrorData,
  SessionTitleChangedData,
  SessionUsageInfoData,
  SubagentStartedData,
  SubagentCompletedData,
  SubagentFailedData,
} from "@/components/copilot/types";
import {
  getPermissionToolName,
  findOrCreateToolPart,
  updateToolPart,
} from "./copilot-chat-helpers";

export interface UseCopilotChatOptions {
  api?: string;
  providerId?: string;
  modelId?: string;
  onIntent?: (intent: string) => void;
  onContextUsage?: (data: SessionUsageInfoData) => void;
  onTitleChanged?: (title: string) => void;
  onError?: (error: string) => void;
  onFinish?: () => void;
}

export interface UseCopilotChatReturn {
  messages: CopilotMessage[];
  status: CopilotChatStatus;
  intent: string | null;
  contextUsage: SessionUsageInfoData | null;
  sessionTitle: string | null;
  sendMessage: (text: string) => void;
  stop: () => void;
  setMessages: (messages: CopilotMessage[]) => void;
  resetSession: () => void;
}

export function useCopilotChat(
  options: UseCopilotChatOptions = {},
): UseCopilotChatReturn {
  const { api = "/api/chat" } = options;

  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [status, setStatus] = useState<CopilotChatStatus>("ready");
  const [intent, setIntent] = useState<string | null>(null);
  const [contextUsage, setContextUsage] =
    useState<SessionUsageInfoData | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Use refs for callbacks to keep handleEvent stable
  const callbacksRef = useRef(options);
  useEffect(() => {
    callbacksRef.current = options;
  });

  const updateAssistantMessage = useCallback(
    (updater: (parts: CopilotPart[]) => CopilotPart[]) => {
      setMessages((prev) => {
        const last = prev.at(-1);
        if (last?.role !== "assistant") return prev;
        const newParts = updater([...last.parts]);
        return [...prev.slice(0, -1), { ...last, parts: newParts }];
      });
    },
    [],
  );

  const handleAssistantIntent = useCallback(
    (data: unknown) => {
      const d = data as AssistantIntentData;
      setIntent(d.intent);
      callbacksRef.current.onIntent?.(d.intent);
    },
    [],
  );

  const handleReasoningDelta = useCallback(
    (data: unknown) => {
      const d = data as AssistantReasoningDeltaData;
      updateAssistantMessage((parts) => {
        const existing = parts.find(
          (p) => p.type === "reasoning" && p.reasoningId === d.reasoningId,
        );
        if (existing?.type === "reasoning") {
          return parts.map((p) =>
            p.type === "reasoning" && p.reasoningId === d.reasoningId
              ? { ...p, text: p.text + d.deltaContent, isStreaming: true }
              : p,
          );
        }
        return [
          ...parts,
          {
            type: "reasoning" as const,
            reasoningId: d.reasoningId,
            text: d.deltaContent,
            isStreaming: true,
          },
        ];
      });
    },
    [updateAssistantMessage],
  );

  const handleReasoningComplete = useCallback(
    (data: unknown) => {
      const d = data as { reasoningId: string };
      updateAssistantMessage((parts) =>
        parts.map((p) =>
          p.type === "reasoning" && p.reasoningId === d.reasoningId
            ? { ...p, isStreaming: false }
            : p,
        ),
      );
    },
    [updateAssistantMessage],
  );

  const handleMessageDelta = useCallback(
    (data: unknown) => {
      const d = data as AssistantMessageDeltaData;
      updateAssistantMessage((parts) => {
        const existing = parts.find(
          (p) => p.type === "text" && p.messageId === d.messageId,
        );
        if (existing?.type === "text") {
          return parts.map((p) =>
            p.type === "text" && p.messageId === d.messageId
              ? { ...p, text: p.text + d.deltaContent }
              : p,
          );
        }
        return [
          ...parts,
          {
            type: "text" as const,
            messageId: d.messageId,
            text: d.deltaContent,
          },
        ];
      });
    },
    [updateAssistantMessage],
  );

  const handleAssistantUsage = useCallback(
    (data: unknown) => {
      const d = data as AssistantUsageData;
      updateAssistantMessage((parts) => [
        ...parts,
        {
          type: "usage" as const,
          model: d.model,
          inputTokens: d.inputTokens,
          outputTokens: d.outputTokens,
          cacheReadTokens: d.cacheReadTokens,
          duration: d.duration,
        },
      ]);
    },
    [updateAssistantMessage],
  );

  const handleToolStart = useCallback(
    (data: unknown) => {
      const d = data as ToolExecutionStartData;
      updateAssistantMessage((parts) => {
        const updated = findOrCreateToolPart(parts, d.toolCallId, {
          toolName: d.toolName,
          arguments: d.arguments,
          state: "running",
        });
        return updateToolPart(updated, d.toolCallId, {
          toolName: d.toolName,
          arguments: d.arguments,
          state: "running",
        });
      });
    },
    [updateAssistantMessage],
  );

  const handleToolProgress = useCallback(
    (data: unknown) => {
      const d = data as ToolExecutionProgressData;
      updateAssistantMessage((parts) => {
        const updated = findOrCreateToolPart(parts, d.toolCallId);
        return updateToolPart(updated, d.toolCallId, {
          progressMessage: d.progressMessage,
        });
      });
    },
    [updateAssistantMessage],
  );

  const handleToolPartialResult = useCallback(
    (data: unknown) => {
      const d = data as ToolExecutionPartialResultData;
      updateAssistantMessage((parts) => {
        const updated = findOrCreateToolPart(parts, d.toolCallId);
        const existing = updated.find(
          (p) => p.type === "tool" && p.toolCallId === d.toolCallId,
        ) as CopilotToolPart | undefined;
        return updateToolPart(updated, d.toolCallId, {
          output: (existing?.output ?? "") + d.partialOutput,
        });
      });
    },
    [updateAssistantMessage],
  );

  const handleToolComplete = useCallback(
    (data: unknown) => {
      const d = data as ToolExecutionCompleteData;
      updateAssistantMessage((parts) => {
        const updated = findOrCreateToolPart(parts, d.toolCallId);
        if (d.success) {
          return updateToolPart(updated, d.toolCallId, {
            state: "completed",
            output: d.result?.detailedContent ?? d.result?.content ?? "",
            progressMessage: undefined,
          });
        }
        return updateToolPart(updated, d.toolCallId, {
          state: "error",
          error: d.error?.message ?? "Tool execution failed",
          progressMessage: undefined,
        });
      });
    },
    [updateAssistantMessage],
  );

  const handlePermissionRequested = useCallback(
    (data: unknown) => {
      const d = data as PermissionRequestedData;
      const req = d.permissionRequest;
      const toolCallId = req.toolCallId;
      if (!toolCallId) return;
      updateAssistantMessage((parts) => {
        const updated = findOrCreateToolPart(parts, toolCallId, {
          toolName: getPermissionToolName(req),
          state: "permission-requested",
          permissionRequest: req,
        });
        return updateToolPart(updated, toolCallId, {
          state: "permission-requested",
          permissionRequest: req,
        });
      });
    },
    [updateAssistantMessage],
  );

  const handlePermissionCompleted = useCallback(
    (data: unknown) => {
      const d = data as PermissionCompletedData;
      if (d.result.kind === "approved") return;
      updateAssistantMessage((parts) =>
        parts.map((p) =>
          p.type === "tool" && p.state === "permission-requested"
            ? { ...p, state: "permission-denied" as const }
            : p,
        ),
      );
    },
    [updateAssistantMessage],
  );

  const handleSessionIdle = useCallback(() => {
    setStatus("ready");
    setIntent(null);
    updateAssistantMessage((parts) =>
      parts.map((p) =>
        p.type === "reasoning" && p.isStreaming
          ? { ...p, isStreaming: false }
          : p,
      ),
    );
    callbacksRef.current.onFinish?.();
  }, [updateAssistantMessage]);

  const handleSessionError = useCallback((data: unknown) => {
    const d = data as SessionErrorData;
    setStatus("error");
    callbacksRef.current.onError?.(d.message);
  }, []);

  const handleTitleChanged = useCallback((data: unknown) => {
    const d = data as SessionTitleChangedData;
    setSessionTitle(d.title);
    callbacksRef.current.onTitleChanged?.(d.title);
  }, []);

  const handleUsageInfo = useCallback((data: unknown) => {
    const d = data as SessionUsageInfoData;
    setContextUsage(d);
    callbacksRef.current.onContextUsage?.(d);
  }, []);

  const handleAbort = useCallback(() => {
    setStatus("ready");
    setIntent(null);
  }, []);

  const handleSubagentStarted = useCallback(
    (data: unknown) => {
      const d = data as SubagentStartedData;
      updateAssistantMessage((parts) => [
        ...parts,
        {
          type: "subagent" as const,
          toolCallId: d.toolCallId,
          agentName: d.agentName,
          agentDisplayName: d.agentDisplayName,
          agentDescription: d.agentDescription,
          state: "running" as const,
        },
      ]);
    },
    [updateAssistantMessage],
  );

  const handleSubagentCompleted = useCallback(
    (data: unknown) => {
      const d = data as SubagentCompletedData;
      updateAssistantMessage((parts) =>
        parts.map((p) =>
          p.type === "subagent" && p.toolCallId === d.toolCallId
            ? { ...p, state: "completed" as const }
            : p,
        ),
      );
    },
    [updateAssistantMessage],
  );

  const handleSubagentFailed = useCallback(
    (data: unknown) => {
      const d = data as SubagentFailedData;
      updateAssistantMessage((parts) =>
        parts.map((p) =>
          p.type === "subagent" && p.toolCallId === d.toolCallId
            ? { ...p, state: "error" as const, error: d.error }
            : p,
        ),
      );
    },
    [updateAssistantMessage],
  );

  const eventHandlers = useRef<Record<string, (data: unknown) => void>>({});

  useEffect(() => {
    eventHandlers.current = {
      "assistant.intent": handleAssistantIntent,
      "assistant.reasoning_delta": handleReasoningDelta,
      "assistant.reasoning": handleReasoningComplete,
      "assistant.message_delta": handleMessageDelta,
      "assistant.usage": handleAssistantUsage,
      "tool.execution_start": handleToolStart,
      "tool.execution_progress": handleToolProgress,
      "tool.execution_partial_result": handleToolPartialResult,
      "tool.execution_complete": handleToolComplete,
      "permission.requested": handlePermissionRequested,
      "permission.completed": handlePermissionCompleted,
      "session.idle": handleSessionIdle,
      "session.error": handleSessionError,
      "session.title_changed": handleTitleChanged,
      "session.usage_info": handleUsageInfo,
      abort: handleAbort,
      "subagent.started": handleSubagentStarted,
      "subagent.completed": handleSubagentCompleted,
      "subagent.failed": handleSubagentFailed,
    };
  });

  const handleEvent = useCallback(
    (event: CopilotEventEnvelope) => {
      eventHandlers.current[event.type]?.(event.data);
    },
    [],
  );

  const parseSSELine = useCallback(
    (line: string) => {
      if (!line.startsWith("data: ")) return;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === "[DONE]") return;
      try {
        handleEvent(JSON.parse(jsonStr) as CopilotEventEnvelope);
      } catch {
        /* skip unparseable lines */
      }
    },
    [handleEvent],
  );

  const processSSEStream = useCallback(
    async (response: Response) => {
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          parseSSELine(line);
        }
      }

      parseSSELine(buffer);
    },
    [parseSSELine],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      abortControllerRef.current?.abort();

      const userMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", messageId: crypto.randomUUID(), text }],
      };

      const assistantMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [],
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setStatus("submitted");
      setIntent(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, providerId: callbacksRef.current.providerId, modelId: callbacksRef.current.modelId }),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}: ${response.statusText}`,
            );
          }
          setStatus("streaming");
          return processSSEStream(response);
        })
        .catch((error: unknown) => {
          if ((error as Error).name === "AbortError") {
            setStatus("ready");
            return;
          }
          setStatus("error");
          callbacksRef.current.onError?.((error as Error).message);
        });
    },
    [api, processSSEStream],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus("ready");
    setIntent(null);
  }, []);

  const resetSession = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setStatus("ready");
    setIntent(null);
    setContextUsage(null);
    setSessionTitle(null);
  }, []);

  return {
    messages,
    status,
    intent,
    contextUsage,
    sessionTitle,
    sendMessage,
    stop,
    setMessages,
    resetSession,
  };
}
