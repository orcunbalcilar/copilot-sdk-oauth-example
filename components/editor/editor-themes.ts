/**
 * Editor Theme Definitions
 *
 * Custom Monaco themes for RestFlow editor (light and dark).
 */

import type * as Monaco from "monaco-editor"

const TEMPLATE_RULE = (fg: string) => [
  { token: "string.template", foreground: fg, fontStyle: "bold" as const },
]

function defineTheme(
  monaco: typeof Monaco,
  name: string,
  base: "vs" | "vs-dark",
  templateColor: string,
  colors: Record<string, string>
) {
  monaco.editor.defineTheme(name, {
    base,
    inherit: true,
    rules: TEMPLATE_RULE(templateColor),
    colors,
  })
}

export function defineRestflowThemes(monaco: typeof Monaco) {
  defineTheme(monaco, "restflow-light", "vs", "0d9488", {
    "editor.background": "#FFFFFF",
    "editor.lineHighlightBackground": "#f8fafc",
    "editorLineNumber.foreground": "#94a3b8",
    "editorLineNumber.activeForeground": "#334155",
    "editor.selectionBackground": "#bfdbfe",
    "editorBracketMatch.background": "#e0f2fe",
    "editorBracketMatch.border": "#38bdf8",
  })

  defineTheme(monaco, "restflow-dark", "vs-dark", "2dd4bf", {
    "editor.background": "#0f172a",
    "editor.lineHighlightBackground": "#1e293b",
    "editorLineNumber.foreground": "#475569",
    "editorLineNumber.activeForeground": "#cbd5e1",
    "editor.selectionBackground": "#1e3a5f",
    "editorBracketMatch.background": "#1e3a5f",
    "editorBracketMatch.border": "#38bdf8",
  })

  defineTheme(monaco, "restflow-universe", "vs-dark", "c084fc", {
    "editor.background": "#0d0a1a",
    "editor.lineHighlightBackground": "#1a1333",
    "editorLineNumber.foreground": "#6b5b95",
    "editorLineNumber.activeForeground": "#c4b5fd",
    "editor.selectionBackground": "#2e1065",
    "editorBracketMatch.background": "#2e1065",
    "editorBracketMatch.border": "#a78bfa",
  })
}

function getEditorThemeName(): string {
  const el = document.documentElement
  if (el.classList.contains("universe")) return "restflow-universe"
  if (el.classList.contains("dark")) return "restflow-dark"
  return "restflow-light"
}

function getEditorThemeFallback(): string {
  const el = document.documentElement
  if (el.classList.contains("universe") || el.classList.contains("dark")) return "vs-dark"
  return "vs"
}

export function applyCurrentTheme(monaco: typeof Monaco) {
  monaco.editor.setTheme(getEditorThemeName())
}

export function applyCurrentThemeSafe(monaco: typeof Monaco) {
  try {
    monaco.editor.setTheme(getEditorThemeName())
  } catch {
    monaco.editor.setTheme(getEditorThemeFallback())
  }
}
