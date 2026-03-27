/**
 * Schema editor sub-components: status bar, validation summary, error list.
 */

import {
  AlertTriangle,
  AlertCircle,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ValidationError } from "./validation"
import { EDITOR_DEFAULTS } from "./constants"

export function EditorStatusBar({
  detectedLanguage,
  readOnly,
  errorCount,
  warningCount,
  infoCount,
  resizable,
  currentHeight,
  onFormat,
  onResetHeight,
}: Readonly<{
  detectedLanguage: string
  readOnly: boolean
  errorCount: number
  warningCount: number
  infoCount: number
  resizable: boolean
  currentHeight: number
  onFormat: () => void
  onResetHeight: () => void
}>) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/40 text-xs">
      <div className="flex items-center gap-3">
        <span className="font-medium text-muted-foreground uppercase tracking-wider">
          {detectedLanguage}
        </span>
        {!readOnly && (
          <ValidationSummary
            errorCount={errorCount}
            warningCount={warningCount}
            infoCount={infoCount}
          />
        )}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        {!readOnly && (
          <button
            type="button"
            onClick={onFormat}
            className="hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
            title="Format document (Shift+Alt+F)"
          >
            Format
          </button>
        )}
        {resizable && (
          <button
            type="button"
            onClick={onResetHeight}
            className="hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted"
            title="Reset height"
          >
            {currentHeight > EDITOR_DEFAULTS.height ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function ValidationSummary({
  errorCount,
  warningCount,
  infoCount,
}: Readonly<{
  errorCount: number
  warningCount: number
  infoCount: number
}>) {
  return (
    <div className="flex items-center gap-2">
      {errorCount > 0 && (
        <span className="flex items-center gap-1 text-red-500">
          <AlertCircle className="h-3 w-3" />
          {errorCount}
        </span>
      )}
      {warningCount > 0 && (
        <span className="flex items-center gap-1 text-amber-500">
          <AlertTriangle className="h-3 w-3" />
          {warningCount}
        </span>
      )}
      {infoCount > 0 && (
        <span className="flex items-center gap-1 text-blue-500">
          <Info className="h-3 w-3" />
          {infoCount}
        </span>
      )}
      {errorCount === 0 && warningCount === 0 && (
        <span className="text-emerald-500">Valid</span>
      )}
    </div>
  )
}

export function ErrorList({
  errors,
}: Readonly<{ errors: ValidationError[] }>) {
  return (
    <div className="max-h-24 overflow-y-auto border-t border-border/40 bg-muted/20">
      {errors.slice(0, 5).map((error, i) => (
        <div
          key={`${error.line}-${error.column}-${i}`}
          className={cn(
            "flex items-start gap-2 px-3 py-1 text-xs border-b border-border/20 last:border-b-0 min-w-0",
            error.severity === "error" && "text-red-600 dark:text-red-400",
            error.severity === "warning" &&
              "text-amber-600 dark:text-amber-400",
            error.severity === "info" && "text-blue-600 dark:text-blue-400",
          )}
          title={error.message}
        >
          {error.severity === "error" && (
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
          )}
          {error.severity === "warning" && (
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          )}
          {error.severity === "info" && (
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
          )}
          <span className="truncate min-w-0">
            <span className="text-muted-foreground shrink-0">
              Ln {error.line}
            </span>{" "}
            {error.message}
          </span>
        </div>
      ))}
      {errors.length > 5 && (
        <div className="px-3 py-1 text-xs text-muted-foreground">
          ...and {errors.length - 5} more
        </div>
      )}
    </div>
  )
}
