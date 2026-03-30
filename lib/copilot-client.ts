/**
 * Copilot SDK Client Manager
 *
 * Manages CopilotClient lifecycle with per-user GitHub token auth.
 * Supports Copilot subscription and BYOK (Vercel AI Gateway) providers.
 */

import type { CopilotClient, ModelInfo } from "@github/copilot-sdk"
import { CopilotClient as SDK } from "@github/copilot-sdk"
import crypto from "node:crypto"

const globalForClients = globalThis as unknown as {
  __copilotDefaultClient?: CopilotClient | null
  __copilotUserClients?: Map<string, CopilotClient>
}

let defaultClient: CopilotClient | null =
  globalForClients.__copilotDefaultClient ?? null
const userClients = (globalForClients.__copilotUserClients ??= new Map())

export function tokenKey(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex").slice(0, 16)
}

/** Models available through the Vercel AI Gateway (BYOK). */
export function getByokModels(): ModelInfo[] {
  if (!process.env.VERCEL_AI_GATEWAY_API_KEY) return []
  return [
    {
      id: "openai/gpt-oss-20b",
      name: "GPT-OSS 20B",
      capabilities: {
        supports: { vision: false, reasoningEffort: false },
        limits: { max_context_window_tokens: 128000 },
      },
    },
  ]
}

export function getClient(githubToken?: string): CopilotClient {
  const logLevel =
    process.env.NODE_ENV === "development"
      ? ("info" as const)
      : ("warning" as const)

  const telemetry = { otlpEndpoint: "http://localhost:4318" }

  if (githubToken) {
    const key = tokenKey(githubToken)
    if (!userClients.has(key)) {
      userClients.set(
        key,
        new SDK({
          logLevel,
          telemetry,
          githubToken,
          useLoggedInUser: false,
        })
      )
    }
    return userClients.get(key)!
  }

  defaultClient ??= new SDK({ logLevel, telemetry })
  globalForClients.__copilotDefaultClient = defaultClient
  return defaultClient
}
