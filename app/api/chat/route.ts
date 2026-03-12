// NOTE: We need a temporary solution to the copilot sdk bug (https://github.com/github/copilot-sdk/issues/707)
// We will remove this in the future after updating the copilot sdk.
// Currently @github/copilot-sdk is pinned to 0.1.30 in package.json.
import { auth } from "@/auth"
import { CopilotClient } from "@github/copilot-sdk"

// Per-user clients keyed by access token
const clients = new Map<string, CopilotClient>()

function getClientForUser(accessToken: string) {
  let client = clients.get(accessToken)
  if (!client) {
    console.log("Creating new CopilotClient for access token:", accessToken)
    client = new CopilotClient({
      githubToken: accessToken,
      useLoggedInUser: false,
    })
    clients.set(accessToken, client)
  }
  return client
}

export async function POST(req: Request) {
  const authSession = await auth()
  if (!authSession?.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { message, sessionId } = await req.json()

  if (!message || typeof message !== "string") {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }

  const copilot = getClientForUser(authSession.accessToken)

  const onPermissionRequest = async () => ({ kind: "approved" as const })

  // Create or resume session
  let copilotSession
  try {
    if (sessionId) {
      copilotSession = await copilot.resumeSession(sessionId, {
        onPermissionRequest,
      })
    } else {
      copilotSession = await copilot.createSession({
        model: "claude-sonnet-4.5",
        streaming: true,
        onPermissionRequest,
      })
    }
  } catch {
    copilotSession = await copilot.createSession({
      model: "claude-sonnet-4.5",
      streaming: true,
      onPermissionRequest,
    })
  }

  const currentSessionId = copilotSession.sessionId

  // Stream the response using SSE via ReadableStream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send session ID immediately
      enqueue({ type: "session", sessionId: currentSessionId })

      copilotSession.on("assistant.message_delta", (event) => {
        enqueue({ type: "delta", content: event.data.deltaContent })
      })

      copilotSession.on("assistant.usage", (event) => {
        enqueue({
          type: "usage",
          inputTokens: event.data.inputTokens ?? 0,
          outputTokens: event.data.outputTokens ?? 0,
        })
      })

      copilotSession.on("session.idle", () => {
        enqueue({ type: "done" })
        controller.close()
      })

      copilotSession.on("session.error", (event) => {
        enqueue({ type: "error", message: event.data.message })
        controller.close()
      })

      await copilotSession.sendAndWait({ prompt: message })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
