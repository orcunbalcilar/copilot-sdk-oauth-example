/**
 * SchemaEditor Component
 *
 * Rich Monaco-based editor for RestFlow scenario schemas.
 * Features: JSON Schema validation, auto-completions, language detection,
 * resizable panel, search/replace, format-on-paste, theme integration.
 */
"use client"

import { useCallback, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { useSchemaEditor } from "./use-schema-editor"
import type { ValidationError } from "./validation"
import type { EditorLanguage } from "./language-detection"
import { EDITOR_DEFAULTS } from "./constants"
import { GripHorizontal } from "lucide-react"
import { EditorStatusBar, ErrorList } from "./editor-parts"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-muted/30 rounded-lg animate-pulse h-100">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        Loading editor...
      </div>
    </div>
  ),
})

export interface SchemaEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  height?: number
  language?: EditorLanguage
  resizable?: boolean
  showMinimap?: boolean
  onValidationChange?: (errors: ValidationError[]) => void
  onLanguageChange?: (language: EditorLanguage) => void
  className?: string
}

export function SchemaEditor({
  value,
  onChange,
  readOnly = false,
  height: heightProp,
  language,
  resizable = true,
  showMinimap = false,
  onValidationChange,
  onLanguageChange,
  className,
}: Readonly<SchemaEditorProps>) {
  const {
    errors,
    detectedLanguage,
    editorHeight,
    updateHeight,
    handleBeforeMount,
    handleMount,
    handleChange,
    formatDocument,
  } = useSchemaEditor({
    initialValue: value,
    onChange,
    onValidationChange,
    onLanguageChange,
    language,
    readOnly,
  })

  const currentHeight = heightProp ?? editorHeight
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable) return
      e.preventDefault()
      setIsResizing(true)

      const startY = e.clientY
      const startHeight = currentHeight

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY
        updateHeight(startHeight + delta)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
    },
    [resizable, currentHeight, updateHeight],
  )

  const errorCount = errors.filter((e) => e.severity === "error").length
  const warningCount = errors.filter((e) => e.severity === "warning").length
  const infoCount = errors.filter((e) => e.severity === "info").length

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-lg border border-border/60 overflow-hidden",
        "bg-background transition-shadow duration-200",
        isResizing && "ring-2 ring-primary/20",
        className,
      )}
    >
      <EditorStatusBar
        detectedLanguage={detectedLanguage}
        readOnly={readOnly}
        errorCount={errorCount}
        warningCount={warningCount}
        infoCount={infoCount}
        resizable={resizable}
        currentHeight={currentHeight}
        onFormat={formatDocument}
        onResetHeight={() => updateHeight(EDITOR_DEFAULTS.height)}
      />

      <MonacoEditor
        height={currentHeight}
        language={detectedLanguage}
        value={value}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{ readOnly, minimap: { enabled: showMinimap } }}
      />

      {resizable && !readOnly && (
        <button
          type="button"
          className={cn(
            "flex items-center justify-center w-full h-2 cursor-row-resize",
            "bg-muted/40 border-t border-border/40",
            "hover:bg-primary/10 transition-colors group",
          )}
          onMouseDown={handleResizeStart}
          aria-label="Resize editor"
        >
          <GripHorizontal className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
        </button>
      )}

      {!readOnly && errors.length > 0 && (
        <ErrorList errors={errors} />
      )}
    </div>
  )
}
