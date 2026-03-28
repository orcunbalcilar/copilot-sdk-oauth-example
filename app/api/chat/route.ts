/**
 * Chat API Route
 *
 * POST /api/chat — streams raw Copilot SDK events as SSE.
 * GET  /api/chat — lists available providers and models via SDK listModels().
 */

import { auth } from "@/auth"
import { pendingApprovals } from "@/lib/approval-store"
import { getByokModels, getClient } from "@/lib/copilot-client"
import { customAgents } from "@/lib/copilot/agents"
import { getMcpServerUrl } from "@/lib/copilot/config"
import { READ_ONLY_MCP_TOOLS } from "@/lib/copilot/constants"
import { AGENT_INSTRUCTIONS } from "@/lib/copilot/instructions"
import { getDefaultModelId, getSessionProvider } from "@/lib/copilot/providers"
import { restflowTools } from "@/lib/copilot/tools"
import type { PermissionRequest, SessionConfig } from "@github/copilot-sdk"

// ============================================================================
// POST — Streaming chat (raw SSE)
// ============================================================================

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { message, providerId, modelId } = (await req.json()) as {
    message: string
    providerId?: string
    modelId?: string
  }

  if (!message?.trim()) {
    return new Response("Empty message", { status: 400 })
  }

  const githubToken = session.accessToken

  try {
    const client = getClient(githubToken)
    const provider = getSessionProvider(providerId)

    const config: SessionConfig = {
      model: modelId || getDefaultModelId(),
      streaming: true,
      tools: restflowTools as SessionConfig["tools"],
      customAgents,
      systemMessage: { mode: "append" as const, content: AGENT_INSTRUCTIONS },
      mcpServers: {
        restflow: {
          type: "http" as const,
          url: getMcpServerUrl(),
          tools: ["*"],
          timeout: 30_000,
        },
      },
      onPermissionRequest: async (request: PermissionRequest) => {
        if (request.kind !== "custom-tool" && request.kind !== "mcp") {
          return { kind: "approved" as const }
        }
        const toolName = (request.toolName as string) ?? ""
        if (READ_ONLY_MCP_TOOLS.has(toolName)) {
          return { kind: "approved" as const }
        }
        const permKey = request.toolCallId ?? `perm-${Date.now()}`
        return new Promise((resolve) => {
          pendingApprovals.set(permKey, { resolve, request })
        })
      },
      ...(provider ? { provider } : {}),
    }

    const copilotSession = await client.createSession(config)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const unsubscribe = copilotSession.on((event) => {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            )
            if (
              event.type === "session.idle" ||
              event.type === "session.error"
            ) {
              unsubscribe()
              controller.close()
            }
          } catch {
            unsubscribe()
            controller.close()
          }
        })

        copilotSession.send({ prompt: message }).catch((err) => {
          const errorEvent = {
            type: "session.error",
            data: {
              error: err instanceof Error ? err.message : "Send failed",
            },
          }
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
          )
          unsubscribe()
          controller.close()
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
  } catch (err) {
    console.error("[Chat] Route error:", err)
    const msg = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: msg }, { status: 500 })
  }
}

// ============================================================================
// GET — Provider & model listing via SDK listModels()
// ============================================================================

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const githubToken = session.accessToken
  const client = getClient(githubToken)
  const defaultModelId = getDefaultModelId()

  interface ProviderEntry {
    id: string
    name: string
    models: Record<string, string>
    defaultModel: string
    supportsReasoning: boolean
  }

  try {
    const modelInfos = await client.listModels()
    const byokIds = new Set(getByokModels().map((m) => m.id))

    const copilotModels: Record<string, string> = {}
    const vercelModels: Record<string, string> = {}
    let hasDefaultModel = false

    for (const m of modelInfos) {
      if (byokIds.has(m.id)) {
        vercelModels[m.id] = m.name
      } else {
        copilotModels[m.id] = m.name
        if (m.id === defaultModelId) hasDefaultModel = true
      }
    }

    if (!hasDefaultModel) {
      copilotModels[defaultModelId] = defaultModelId
    }

    const supportsReasoning = modelInfos
      .filter((m) => !byokIds.has(m.id))
      .some((m) => m.capabilities?.supports?.reasoningEffort)

    const providers: ProviderEntry[] = [
      {
        id: "copilot",
        name: "GitHub Copilot",
        models: copilotModels,
        defaultModel: hasDefaultModel
          ? defaultModelId
          : Object.keys(copilotModels)[0],
        supportsReasoning,
      },
    ]

    if (Object.keys(vercelModels).length > 0) {
      providers.push({
        id: "vercel",
        name: "Vercel AI Gateway",
        models: vercelModels,
        defaultModel: Object.keys(vercelModels)[0],
        supportsReasoning: false,
      })
    }

    return Response.json({ providers, defaultProvider: "copilot" })
  } catch (err) {
    console.error("[Chat] listModels error:", err)
    const providers: ProviderEntry[] = [
      {
        id: "copilot",
        name: "GitHub Copilot",
        models: { [defaultModelId]: defaultModelId },
        defaultModel: defaultModelId,
        supportsReasoning: true,
      },
    ]
    return Response.json({ providers, defaultProvider: "copilot" })
  }
}
