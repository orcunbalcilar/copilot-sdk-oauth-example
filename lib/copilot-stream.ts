import type { UIMessageStreamWriter } from "ai"
import type { CopilotSession } from "@github/copilot-sdk"

export function pipeCopilotToUIStream(
  session: CopilotSession,
  writer: UIMessageStreamWriter,
  prompt: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let textId = crypto.randomUUID()
    let textStarted = false
    let reasoningId = ""
    let reasoningStarted = false

    // ----- Helper to close open text/reasoning blocks -----
    function closeText() {
      if (textStarted) {
        writer.write({ type: "text-end", id: textId })
        textStarted = false
      }
    }
    function closeReasoning() {
      if (reasoningStarted) {
        writer.write({ type: "reasoning-end", id: reasoningId })
        reasoningStarted = false
      }
    }

    // ===== ASSISTANT EVENTS =====

    session.on("assistant.intent", (event) => {
      writer.write({
        type: "data-intent" as never,
        data: { intent: event.data.intent },
        transient: true,
      } as never)
    })

    session.on("assistant.reasoning_delta", (event) => {
      const rid = event.data.reasoningId || reasoningId || crypto.randomUUID()
      if (!reasoningStarted) {
        reasoningId = rid
        reasoningStarted = true
        writer.write({ type: "reasoning-start", id: reasoningId })
      }
      writer.write({
        type: "reasoning-delta",
        id: reasoningId,
        delta: event.data.deltaContent,
      })
    })

    session.on("assistant.message_delta", (event) => {
      closeReasoning()
      if (!textStarted) {
        textStarted = true
        writer.write({ type: "text-start", id: textId })
      }
      writer.write({
        type: "text-delta",
        id: textId,
        delta: event.data.deltaContent,
      })
    })

    session.on("assistant.usage", (event) => {
      writer.write({
        type: "data-usage" as never,
        data: {
          model: event.data.model,
          inputTokens: event.data.inputTokens,
          outputTokens: event.data.outputTokens,
          cacheReadTokens: event.data.cacheReadTokens,
          duration: event.data.duration,
        },
      } as never)
    })

    // ===== TOOL EVENTS =====

    session.on("tool.execution_start", (event) => {
      closeText()
      closeReasoning()
      writer.write({
        type: "tool-input-available",
        toolCallId: event.data.toolCallId,
        toolName: event.data.toolName,
        input: event.data.arguments ?? {},
      })
    })

    session.on("tool.execution_progress", (event) => {
      writer.write({
        type: "data-tool-progress" as never,
        data: {
          toolCallId: event.data.toolCallId,
          progressMessage: event.data.progressMessage,
        },
        transient: true,
      } as never)
    })

    session.on("tool.execution_partial_result", (event) => {
      writer.write({
        type: "tool-output-available",
        toolCallId: event.data.toolCallId,
        output: event.data.partialOutput,
        preliminary: true,
      })
    })

    session.on("tool.execution_complete", (event) => {
      if (event.data.success) {
        const result = event.data.result as { content?: string; detailedContent?: string } | undefined
        writer.write({
          type: "tool-output-available",
          toolCallId: event.data.toolCallId,
          output: result?.detailedContent ?? result?.content ?? "",
        })
      } else {
        const error = event.data.error as { message?: string } | undefined
        writer.write({
          type: "tool-output-error",
          toolCallId: event.data.toolCallId,
          errorText: error?.message ?? "Tool execution failed",
        })
      }
      textId = crypto.randomUUID()
    })

    // ===== PERMISSION EVENTS =====

    session.on("permission.requested", (event) => {
      const req = event.data.permissionRequest as { toolCallId?: string } | undefined
      const toolCallId = req?.toolCallId
      if (toolCallId) {
        writer.write({
          type: "tool-approval-request",
          approvalId: toolCallId,
          toolCallId,
        })
      }
    })

    session.on("permission.completed", (event) => {
      const resultKind = (event.data.result as { kind?: string })?.kind
      if (resultKind && resultKind !== "approved") {
        writer.write({
          type: "data-permission" as never,
          data: {
            requestId: event.data.requestId,
            result: resultKind,
          },
        } as never)
      }
    })

    // ===== SESSION LIFECYCLE EVENTS =====

    session.on("session.idle", () => {
      closeText()
      closeReasoning()
      writer.write({ type: "finish", finishReason: "stop" })
      resolve()
    })

    session.on("session.error", (event) => {
      closeText()
      closeReasoning()
      writer.write({ type: "error", errorText: event.data.message })
      reject(new Error(event.data.message))
    })

    session.on("session.usage_info", (event) => {
      writer.write({
        type: "data-context-usage" as never,
        data: {
          tokenLimit: event.data.tokenLimit,
          currentTokens: event.data.currentTokens,
          messagesLength: event.data.messagesLength,
        },
        transient: true,
      } as never)
    })

    session.on("session.title_changed", (event) => {
      writer.write({
        type: "data-title" as never,
        data: { title: event.data.title },
        transient: true,
      } as never)
    })

    // ===== ABORT =====

    session.on("abort", (event) => {
      closeText()
      closeReasoning()
      writer.write({ type: "abort", reason: event.data.reason })
    })

    // Start the conversation
    session.sendAndWait({ prompt })
  })
}
