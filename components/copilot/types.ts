// ============================================================================
// Copilot SDK Event Types (matching github/copilot-sdk streaming events)
// ============================================================================

/** Common event envelope fields for all copilot session events. */
export interface CopilotEventEnvelope {
  id: string;
  timestamp: string;
  parentId: string | null;
  ephemeral?: boolean;
  type: string;
  data: Record<string, unknown>;
}

// ----- Assistant Events -----

export interface AssistantTurnStartData {
  turnId: string;
  interactionId?: string;
}

export interface AssistantIntentData {
  intent: string;
}

export interface AssistantReasoningData {
  reasoningId: string;
  content: string;
}

export interface AssistantReasoningDeltaData {
  reasoningId: string;
  deltaContent: string;
}

export interface AssistantMessageData {
  messageId: string;
  content: string;
  toolRequests?: CopilotToolRequest[];
  reasoningText?: string;
  outputTokens?: number;
  parentToolCallId?: string;
}

export interface AssistantMessageDeltaData {
  messageId: string;
  deltaContent: string;
  parentToolCallId?: string;
}

export interface AssistantTurnEndData {
  turnId: string;
}

export interface AssistantUsageData {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  cost?: number;
  duration?: number;
}

export interface CopilotToolRequest {
  toolCallId: string;
  name: string;
  arguments?: Record<string, unknown>;
  type?: "function" | "custom";
}

// ----- Tool Events -----

export interface ToolExecutionStartData {
  toolCallId: string;
  toolName: string;
  arguments?: Record<string, unknown>;
  mcpServerName?: string;
  parentToolCallId?: string;
}

export interface ToolExecutionProgressData {
  toolCallId: string;
  progressMessage: string;
}

export interface ToolExecutionPartialResultData {
  toolCallId: string;
  partialOutput: string;
}

export interface ToolExecutionCompleteData {
  toolCallId: string;
  success: boolean;
  result?: { content: string; detailedContent?: string };
  error?: { message: string; code?: string };
  parentToolCallId?: string;
}

// ----- Permission Events -----

export interface PermissionRequestedData {
  requestId: string;
  permissionRequest: CopilotPermissionRequest;
}

export interface CopilotPermissionRequest {
  kind:
    | "shell"
    | "write"
    | "read"
    | "mcp"
    | "url"
    | "memory"
    | "custom-tool";
  toolCallId?: string;
  intention?: string;
  fullCommandText?: string;
  commands?: string[];
  fileName?: string;
  diff?: string;
  path?: string;
  serverName?: string;
  toolName?: string;
  toolTitle?: string;
  args?: Record<string, unknown>;
  readOnly?: boolean;
  url?: string;
}

export interface PermissionCompletedData {
  requestId: string;
  result: { kind: string };
}

// ----- Session Events -----

export interface SessionIdleData {
  backgroundTasks?: unknown;
}

export interface SessionErrorData {
  errorType: string;
  message: string;
  statusCode?: number;
}

export interface SessionTitleChangedData {
  title: string;
}

export interface SessionUsageInfoData {
  tokenLimit: number;
  currentTokens: number;
  messagesLength: number;
}

export interface SessionCompactionCompleteData {
  success: boolean;
  preCompactionTokens?: number;
  postCompactionTokens?: number;
  summaryContent?: string;
}

export interface AbortData {
  reason: string;
}

// ----- Sub-Agent Events -----

export interface SubagentStartedData {
  toolCallId: string;
  agentName: string;
  agentDisplayName: string;
  agentDescription: string;
}

export interface SubagentCompletedData {
  toolCallId: string;
  agentName: string;
  agentDisplayName: string;
}

export interface SubagentFailedData {
  toolCallId: string;
  agentName: string;
  agentDisplayName: string;
  error: string;
}

// ============================================================================
// Conversation Model (for the hook / components)
// ============================================================================

export type CopilotChatStatus = "ready" | "submitted" | "streaming" | "error";

// ----- Message parts -----

export interface CopilotTextPart {
  type: "text";
  messageId: string;
  text: string;
}

export interface CopilotReasoningPart {
  type: "reasoning";
  reasoningId: string;
  text: string;
  isStreaming: boolean;
}

export type CopilotToolState =
  | "permission-requested"
  | "permission-denied"
  | "running"
  | "progress"
  | "completed"
  | "error";

export interface CopilotToolPart {
  type: "tool";
  toolCallId: string;
  toolName: string;
  arguments?: Record<string, unknown>;
  state: CopilotToolState;
  output?: string;
  error?: string;
  progressMessage?: string;
  permissionRequest?: CopilotPermissionRequest;
}

export interface CopilotUsagePart {
  type: "usage";
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  duration?: number;
}

export type CopilotSubagentState = "running" | "completed" | "error";

export interface CopilotSubagentPart {
  type: "subagent";
  toolCallId: string;
  agentName: string;
  agentDisplayName: string;
  agentDescription: string;
  state: CopilotSubagentState;
  error?: string;
}

export type CopilotPart =
  | CopilotTextPart
  | CopilotReasoningPart
  | CopilotToolPart
  | CopilotUsagePart
  | CopilotSubagentPart;

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  parts: CopilotPart[];
}
