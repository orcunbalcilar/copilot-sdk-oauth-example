/**
 * Language Auto-Detection
 *
 * Lightweight heuristic to detect JSON vs YAML content.
 */

export type EditorLanguage = "json" | "yaml"

export function detectLanguage(content: string): EditorLanguage {
  const trimmed = content.trimStart()

  if (trimmed.length === 0) return "json"
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json"
  if (trimmed.startsWith("---")) return "yaml"
  if (/^[a-zA-Z_]\w*\s*:/m.test(trimmed) && !trimmed.includes("{"))
    return "yaml"

  return "json"
}
