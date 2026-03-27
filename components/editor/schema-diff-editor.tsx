/**
 * SchemaDiffEditor Component
 *
 * Monaco-based side-by-side diff editor for scenario version comparison.
 */
"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef } from "react"
import type * as Monaco from "monaco-editor"
import { cn } from "@/lib/utils"
import type { EditorLanguage } from "./language-detection"
import { detectLanguage } from "./language-detection"
import { applyCurrentThemeSafe } from "./editor-themes"

const MonacoDiffEditor = dynamic(
  () =>
    import("@monaco-editor/react").then((mod) => ({
      default: mod.DiffEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-muted/30 rounded-lg animate-pulse h-100">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Loading diff editor...
        </div>
      </div>
    ),
  },
)

export interface SchemaDiffEditorProps {
  original: string
  modified: string
  language?: EditorLanguage
  height?: string | number
  readOnly?: boolean
  className?: string
}

export function SchemaDiffEditor({
  original,
  modified,
  language,
  height = "50vh",
  readOnly = true,
  className,
}: Readonly<SchemaDiffEditorProps>) {
  const monacoRef = useRef<typeof Monaco | null>(null)
  const detectedLang = language ?? detectLanguage(modified || original)

  const formatJson = (text: string): string => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      return text
    }
  }

  const formattedOriginal =
    detectedLang === "json" ? formatJson(original) : original
  const formattedModified =
    detectedLang === "json" ? formatJson(modified) : modified

  const handleBeforeMount = useCallback((monaco: typeof Monaco) => {
    monacoRef.current = monaco
    applyCurrentThemeSafe(monaco)
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (monacoRef.current) {
        applyCurrentThemeSafe(monacoRef.current)
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/40 text-xs">
        <span className="font-medium text-muted-foreground uppercase tracking-wider">
          Diff View — {detectedLang}
        </span>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400/70" />
            {" "}Removed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/70" />
            {" "}Added
          </span>
        </div>
      </div>
      <MonacoDiffEditor
        height={height}
        language={detectedLang}
        original={formattedOriginal}
        modified={formattedModified}
        beforeMount={handleBeforeMount}
        options={{
          readOnly,
          renderSideBySide: true,
          enableSplitViewResizing: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 13,
          lineHeight: 20,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  )
}
