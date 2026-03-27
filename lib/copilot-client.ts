import type {
  PermissionRequestResult,
} from "@github/copilot-sdk";
import { CopilotClient } from "@github/copilot-sdk";
import type { ProviderConfig } from "./chat-settings";

// Persist clients across HMR in development
const globalStore = globalThis as unknown as {
  __copilotClients?: Map<string, { client: CopilotClient; createdAt: number }>;
};
const clients = (globalStore.__copilotClients ??= new Map());
const CLIENT_TTL_MS = 5 * 60 * 1000;

export function getClient(accessToken: string): CopilotClient {
  const existing = clients.get(accessToken);
  if (existing && Date.now() - existing.createdAt < CLIENT_TTL_MS) {
    return existing.client;
  }
  const client = new CopilotClient({
    telemetry: { otlpEndpoint: "http://localhost:4318" },
    githubToken: accessToken,
  });
  clients.set(accessToken, { client, createdAt: Date.now() });
  return client;
}

// Auto-approve all tool requests (user preference)
export function autoApproveHandler(): Promise<PermissionRequestResult> {
  return Promise.resolve({ kind: "approved" });
}

export function resolveProviderConfig(
  providerId?: string,
): ProviderConfig | undefined {
  if (!providerId || providerId === "copilot") return undefined;

  if (providerId === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return undefined;
    return {
      id: "openrouter",
      name: "OpenRouter",
      models: {
        "google/gemini-2.0-flash-001": "Gemini 2.0 Flash",
        "anthropic/claude-sonnet-4": "Claude Sonnet 4",
        "openai/gpt-4.1": "GPT-4.1",
        "openai/gpt-oss-20b:free": "GPT-OSS 20B (Free)",
      },
      defaultModel: "openai/gpt-oss-20b:free",
      supportsReasoning: false,
    };
  }

  if (providerId === "vercel") {
    const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
    if (!apiKey) return undefined;
    return {
      id: "vercel",
      name: "Vercel AI Gateway",
      models: { "openai/gpt-oss-20b": "GPT-OSS 20B" },
      defaultModel: "openai/gpt-oss-20b",
      supportsReasoning: false,
    };
  }

  return undefined;
}

export function getSessionProvider(providerId?: string) {
  if (!providerId || providerId === "copilot") return undefined;

  if (providerId === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return undefined;
    return {
      type: "openai" as const,
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey,
    };
  }

  if (providerId === "vercel") {
    const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
    if (!apiKey) return undefined;
    return {
      type: "openai" as const,
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      apiKey,
    };
  }

  return undefined;
}

export function getDefaultModelId(): string {
  return process.env.LLM_MODEL_ID || "gpt-oss-20b";
}
