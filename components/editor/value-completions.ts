/**
 * Value-based completion providers.
 *
 * Header names, header values (Content-Type, Auth), and HTTP status codes.
 */

import type * as Monaco from "monaco-editor"
import {
  COMMON_REQUEST_HEADERS,
  CONTENT_TYPES,
  AUTH_PREFIXES,
  HTTP_STATUS_CODES,
} from "./constants"
import {
  isInsideHeaderName,
  isInsideHeaderValue,
  isInsideStatusCodeValue,
  getNearbyLines,
} from "./completion-context"

export function registerHeaderNameProvider(
  monaco: typeof Monaco,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("json", {
    triggerCharacters: ['"'],
    provideCompletionItems: (model, position) => {
      const textBefore = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (!isInsideHeaderName(textBefore)) {
        return { suggestions: [] }
      }

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      return {
        suggestions: COMMON_REQUEST_HEADERS.map((header, index) => ({
          label: header,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: header,
          range,
          sortText: String(index).padStart(3, "0"),
        })),
      }
    },
  })
}

export function registerHeaderValueProvider(
  monaco: typeof Monaco,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("json", {
    triggerCharacters: ['"'],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const suggestions: Monaco.languages.CompletionItem[] = []

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      const nearbyText = getNearbyLines(model, position.lineNumber, 3)
      if (
        /Content-Type|Accept/i.test(nearbyText) &&
        isInsideHeaderValue(lineContent, position.column)
      ) {
        CONTENT_TYPES.forEach((ct, index) => {
          suggestions.push({
            label: ct,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: ct,
            range,
            sortText: String(index).padStart(3, "0"),
          })
        })
      }

      if (
        /Authorization/i.test(nearbyText) &&
        isInsideHeaderValue(lineContent, position.column)
      ) {
        AUTH_PREFIXES.forEach((prefix, index) => {
          suggestions.push({
            label: prefix.label,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: prefix.insertText,
            range,
            sortText: String(index).padStart(3, "0"),
          })
        })
      }

      return { suggestions }
    },
  })
}

export function registerStatusCodeProvider(
  monaco: typeof Monaco,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("json", {
    triggerCharacters: [":", " "],
    provideCompletionItems: (model, position) => {
      const textBefore = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (!isInsideStatusCodeValue(textBefore)) {
        return { suggestions: [] }
      }

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      return {
        suggestions: HTTP_STATUS_CODES.map((sc, index) => ({
          label: `${sc.code} ${sc.label}`,
          kind: monaco.languages.CompletionItemKind.EnumMember,
          insertText: String(sc.code),
          range,
          documentation: `${sc.category}: ${sc.label}`,
          detail: sc.category,
          sortText: String(index).padStart(3, "0"),
        })),
      }
    },
  })
}
