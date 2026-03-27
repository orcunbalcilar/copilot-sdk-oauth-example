/**
 * Editor Theme Definitions
 *
 * Custom Monaco themes for RestFlow editor (light and dark).
 */

import type * as Monaco from "monaco-editor"

export function defineRestflowThemes(monaco: typeof Monaco) {
  monaco.editor.defineTheme("restflow-light", {
    base: "vs",
    inherit: true,
    rules: [
      {
        token: "string.template",
        foreground: "0d9488",
        fontStyle: "bold",
      },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.lineHighlightBackground": "#f8fafc",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#334155",
      "editor.selectionBackground": "#bfdbfe",
      "editorBracketMatch.background": "#e0f2fe",
      "editorBracketMatch.border": "#38bdf8",
    },
  })

  monaco.editor.defineTheme("restflow-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      {
        token: "string.template",
        foreground: "2dd4bf",
        fontStyle: "bold",
      },
    ],
    colors: {
      "editor.background": "#0f172a",
      "editor.lineHighlightBackground": "#1e293b",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#cbd5e1",
      "editor.selectionBackground": "#1e3a5f",
      "editorBracketMatch.background": "#1e3a5f",
      "editorBracketMatch.border": "#38bdf8",
    },
  })
}

export function applyCurrentTheme(monaco: typeof Monaco) {
  const isDark = document.documentElement.classList.contains("dark")
  monaco.editor.setTheme(isDark ? "restflow-dark" : "restflow-light")
}

export function applyCurrentThemeSafe(monaco: typeof Monaco) {
  const isDark = document.documentElement.classList.contains("dark")
  try {
    monaco.editor.setTheme(isDark ? "restflow-dark" : "restflow-light")
  } catch {
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs")
  }
}
