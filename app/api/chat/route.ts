import { auth } from "@/auth"
import { pendingApprovals } from "@/lib/approval-store"
import { pipeCopilotToUIStream } from "@/lib/copilot-stream"
import type {
  PermissionRequest,
  PermissionRequestResult,
} from "@github/copilot-sdk"
import { CopilotClient } from "@github/copilot-sdk"
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  UIMessage,
} from "ai"

// Per-user clients keyed by access token
const clients = new Map<string, { client: CopilotClient; createdAt: number }>()

function getClientForUser(accessToken: string) {
  const existing = clients.get(accessToken)
  // Reuse client for up to 5 minutes
  if (existing && Date.now() - existing.createdAt < 5 * 60 * 1000) {
    return existing.client
  }
  const client = new CopilotClient({
    telemetry: {
      otlpEndpoint: "http://localhost:4318",
    },
  })
  clients.set(accessToken, { client, createdAt: Date.now() })
  return client
}

export async function POST(req: Request) {
  const authSession = await auth()
  if (!authSession?.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  // Extract the last user message text
  const lastUserMessage = messages.findLast((m) => m.role === "user")
  const messageText =
    lastUserMessage?.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("\n") ?? ""

  if (!messageText) {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }

  const copilot = getClientForUser(authSession.accessToken)

  const onPermissionRequest = async (
    request: PermissionRequest
  ): Promise<PermissionRequestResult> => {
    const toolCallId = request.toolCallId
    if (!toolCallId) {
      return { kind: "approved" }
    }

    // Wait for user approval via the /api/chat/approve endpoint
    const result = await new Promise<PermissionRequestResult>((resolve) => {
      pendingApprovals.set(toolCallId, { resolve, request })

      // Auto-approve after 30s timeout to prevent indefinite blocking
      setTimeout(() => {
        if (pendingApprovals.has(toolCallId)) {
          pendingApprovals.delete(toolCallId)
          resolve({ kind: "approved" })
        }
      }, 30_000)
    })

    return result
  }

  const copilotSession = await copilot.createSession({
    streaming: true,
    onPermissionRequest,
    model: "openai/gpt-4o-mini",
    provider: {
      type: "openai",
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY!,
    },
  })

  const stream = createUIMessageStream({
    execute: ({ writer }) =>
      pipeCopilotToUIStream(copilotSession, writer, messageText),
  })

  return createUIMessageStreamResponse({ stream })
}
