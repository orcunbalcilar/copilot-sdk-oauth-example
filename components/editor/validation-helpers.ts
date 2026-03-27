/**
 * Validation helpers — Marker creation and source position mapping.
 */

import type * as Monaco from "monaco-editor"
import { parseTree } from "jsonc-parser"

export interface ValidationError {
  message: string
  path: string
  line: number
  column: number
  endLine: number
  endColumn: number
  severity: "error" | "warning" | "info"
}

export interface ValidationCtx {
  jsonText: string
  tree: ReturnType<typeof parseTree>
  monaco: typeof Monaco
  errors: ValidationError[]
  markers: Monaco.editor.IMarkerData[]
}

export function addMarker(
  message: string,
  path: (string | number)[],
  ctx: ValidationCtx,
  severity: "error" | "warning",
) {
  let startLine = 1,
    startCol = 1,
    endLine = 1,
    endCol = 1
  if (ctx.tree) {
    const location = findNodeByPath(ctx.tree, path, ctx.jsonText)
    if (location) {
      startLine = location.startLine
      startCol = location.startCol
      endLine = location.endLine
      endCol = location.endCol
    }
  }
  ctx.markers.push({
    severity:
      severity === "error"
        ? ctx.monaco.MarkerSeverity.Error
        : ctx.monaco.MarkerSeverity.Warning,
    message,
    startLineNumber: startLine,
    startColumn: startCol,
    endLineNumber: endLine,
    endColumn: endCol,
    source: "restflow",
  })
  ctx.errors.push({
    message,
    path: path.join("."),
    line: startLine,
    column: startCol,
    endLine,
    endColumn: endCol,
    severity,
  })
}

function markerSeverity(
  m: Monaco.editor.IMarkerData,
): "error" | "warning" | "info" {
  if (m.severity === 8) return "error"
  if (m.severity === 4) return "warning"
  return "info"
}

export function markersToErrors(
  allMarkers: Monaco.editor.IMarkerData[],
): ValidationError[] {
  return allMarkers.map((m) => ({
    message: m.message,
    path: m.source ?? "",
    line: m.startLineNumber,
    column: m.startColumn,
    endLine: m.endLineNumber,
    endColumn: m.endColumn,
    severity: markerSeverity(m),
  }))
}

function findNodeByPath(
  tree: NonNullable<ReturnType<typeof parseTree>>,
  path: (string | number)[],
  source: string,
): {
  startLine: number
  startCol: number
  endLine: number
  endCol: number
} | null {
  let node = tree
  for (const segment of path) {
    if (!node.children) return null

    if (typeof segment === "number") {
      if (node.children[segment]) {
        node = node.children[segment]
      } else {
        return null
      }
    } else {
      const prop = node.children.find((child) => {
        if (child.type === "property" && child.children?.[0]) {
          return child.children[0].value === segment
        }
        return false
      })
      if (prop?.children?.[1]) {
        node = prop.children[1]
      } else {
        return null
      }
    }
  }

  const offset = node.offset
  const endOffset = offset + node.length
  const lines = source.substring(0, offset).split("\n")
  const endLines = source.substring(0, endOffset).split("\n")

  return {
    startLine: lines.length,
    startCol: (lines.at(-1)?.length ?? 0) + 1,
    endLine: endLines.length,
    endCol: (endLines.at(-1)?.length ?? 0) + 1,
  }
}
