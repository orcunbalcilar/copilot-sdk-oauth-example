/**
 * BYOK Provider Configuration
 *
 * Defines provider session configs (for SDK) and model listing (via SDK listModels).
 */

// ============================================================================
// Session-level provider (passed to SDK)
// ============================================================================

export interface ProviderSessionConfig {
  type: "openai";
  baseUrl: string;
  apiKey: string;
}

export function getSessionProvider(
  providerId?: string,
): ProviderSessionConfig | undefined {
  if (!providerId || providerId === "copilot") return undefined;

  if (providerId === "vercel") {
    const apiKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
    if (!apiKey) return undefined;
    return {
      type: "openai",
      baseUrl: "https://ai-gateway.vercel.sh/v1",
      apiKey,
    };
  }

  return undefined;
}

export function getDefaultModelId(): string {
  return process.env.LLM_MODEL_ID || "gpt-5-mini";
}
