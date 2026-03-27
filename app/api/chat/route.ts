import { auth } from "@/auth"
import {
  getClient,
  autoApproveHandler,
  getSessionProvider,
  getDefaultModelId,
  resolveProviderConfig,
} from "@/lib/copilot-client"

// ============================================================================
// GET — Provider & model listing
// ============================================================================

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const providers = [
    {
      id: "copilot",
      name: "GitHub Copilot",
      models: { [getDefaultModelId()]: getDefaultModelId() },
      defaultModel: getDefaultModelId(),
      supportsReasoning: true,
    },
  ]

  // Add configured BYOK providers
  const openrouter = resolveProviderConfig("openrouter")
  if (openrouter) providers.push(openrouter)

  const vercel = resolveProviderConfig("vercel")
  if (vercel) providers.push(vercel)

  return Response.json({ providers, defaultProvider: "copilot" })
}

// ============================================================================
// POST — Streaming chat
// ============================================================================

interface ChatRequest {
  message: string
  providerId?: string
  modelId?: string
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: ChatRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.message?.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }

  const copilot = getClient(session.accessToken)
  const provider = getSessionProvider(body.providerId)
  const modelId = body.modelId || getDefaultModelId()

  let copilotSession
  try {
    copilotSession = await copilot.createSession({
      streaming: true,
      onPermissionRequest: autoApproveHandler,
      model: provider ? modelId : getDefaultModelId(),
      ...(provider && { provider }),
    })
  } catch {
    return Response.json({ error: "Failed to create session" }, { status: 502 })
  }

  return streamSession(copilotSession, body.message)
}

function streamSession(
  copilotSession: Awaited<ReturnType<ReturnType<typeof getClient>["createSession"]>>,
  message: string,
) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      copilotSession.on((event) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          )
        } catch {
          // Stream may already be closed
        }

        if (event.type === "session.idle" || event.type === "session.error") {
          try {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch {
            // Already closed
          }
        }
      })

      copilotSession.sendAndWait({ prompt: message }).catch(() => {
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
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
