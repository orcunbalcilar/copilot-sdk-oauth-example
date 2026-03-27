/**
 * Completion Context Detection
 *
 * Helpers that analyze cursor position and surrounding text to determine
 * which auto-completion providers should activate.
 */

import type * as Monaco from "monaco-editor"

export function isInsideAssertionsArray(textBefore: string): boolean {
  const lastAssertions = textBefore.lastIndexOf('"assertions"')
  if (lastAssertions < 0) return false

  const afterAssertions = textBefore.substring(lastAssertions)
  const openBrackets = (afterAssertions.match(/\[/g) || []).length
  const closeBrackets = (afterAssertions.match(/\]/g) || []).length
  return openBrackets > closeBrackets
}

export function isInsideStepsArray(textBefore: string): boolean {
  const lastSteps = textBefore.lastIndexOf('"steps"')
  if (lastSteps < 0) return false

  const afterSteps = textBefore.substring(lastSteps)
  const openBrackets = (afterSteps.match(/\[/g) || []).length
  const closeBrackets = (afterSteps.match(/\]/g) || []).length
  return openBrackets > closeBrackets
}

export function isInsideHeaderName(textBefore: string): boolean {
  const lastHeaders = textBefore.lastIndexOf('"headers"')
  if (lastHeaders < 0) return false

  const afterHeaders = textBefore.substring(lastHeaders)
  const openBrackets = (afterHeaders.match(/\[/g) || []).length
  const closeBrackets = (afterHeaders.match(/\]/g) || []).length
  if (openBrackets <= closeBrackets) return false

  return /"name"\s*:\s*"[^"]*$/.test(
    textBefore.substring(textBefore.length - 50),
  )
}

export function isInsideHeaderValue(
  lineContent: string,
  column: number,
): boolean {
  const beforeCursor = lineContent.substring(0, column - 1)
  return /"value"\s*:\s*"[^"]*$/.test(beforeCursor)
}

export function isInsideStatusCodeValue(textBefore: string): boolean {
  const lastStatusCode = textBefore.lastIndexOf('"statusCode"')
  if (lastStatusCode < 0) return false

  const afterType = textBefore.substring(lastStatusCode)
  return /"value"\s*:\s*\d*$/.test(afterType)
}

export function getNearbyLines(
  model: Monaco.editor.ITextModel,
  lineNumber: number,
  range: number,
): string {
  const startLine = Math.max(1, lineNumber - range)
  const endLine = Math.min(model.getLineCount(), lineNumber + range)
  const lines: string[] = []
  for (let i = startLine; i <= endLine; i++) {
    lines.push(model.getLineContent(i))
  }
  return lines.join("\n")
}
