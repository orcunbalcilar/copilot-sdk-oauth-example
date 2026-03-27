/**
 * Snippet-based completion providers.
 *
 * Handlebars template helpers, assertion snippets, and step scaffolds.
 */

import type * as Monaco from "monaco-editor"
import {
  HANDLEBARS_HELPERS,
  ASSERTION_SNIPPETS,
  STEP_SCAFFOLDS,
} from "./constants"
import {
  isInsideAssertionsArray,
  isInsideStepsArray,
} from "./completion-context"

export function registerHandlebarsProvider(
  monaco: typeof Monaco,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("json", {
    triggerCharacters: ["{"],
    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: Math.max(1, position.column - 3),
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (!textUntilPosition.includes("{{")) {
        return { suggestions: [] }
      }

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      const lineContent = model.getLineContent(position.lineNumber)
      const beforeCursor = lineContent.substring(0, position.column - 1)
      const lastBraces = beforeCursor.lastIndexOf("{{")

      const replaceRange =
        lastBraces >= 0
          ? {
              startLineNumber: position.lineNumber,
              startColumn: lastBraces + 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            }
          : range

      const suggestions: Monaco.languages.CompletionItem[] =
        HANDLEBARS_HELPERS.map((helper, index) => ({
          label: `{{${helper.name}}}`,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: helper.insertText,
          range: replaceRange,
          documentation: helper.documentation,
          sortText: String(index).padStart(3, "0"),
        }))

      const fullText = model.getValue()
      const contextVarMatches = fullText.matchAll(
        /"contextValues"\s*:\s*\{([^}]+)\}/g,
      )
      for (const match of contextVarMatches) {
        const keyMatches = match[1].matchAll(/"([^"]+)"\s*:/g)
        for (const keyMatch of keyMatches) {
          suggestions.push({
            label: `{{${keyMatch[1]}}}`,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: `{{${keyMatch[1]}}}`,
            range: replaceRange,
            documentation: "Context variable from setup step",
            sortText: "100",
          })
        }
      }

      return { suggestions }
    },
  })
}

export function registerAssertionProvider(
  monaco: typeof Monaco,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("json", {
    triggerCharacters: ["{", '"'],
    provideCompletionItems: (model, position) => {
      const textBefore = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (!isInsideAssertionsArray(textBefore)) {
        return { suggestions: [] }
      }

      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      const suggestions: Monaco.languages.CompletionItem[] = []
      let sortIndex = 0

      for (const [category, snippets] of Object.entries(ASSERTION_SNIPPETS)) {
        for (const snippet of snippets) {
          suggestions.push({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: `${category} assertion`,
            detail: category,
            sortText: String(sortIndex++).padStart(3, "0"),
          })
        }
      }

      return { suggestions }
    },
  })
}

export function registerStepProvider(
  monaco: typeof Monaco,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("json", {
    triggerCharacters: ["{"],
    provideCompletionItems: (model, position) => {
      const textBefore = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      if (!isInsideStepsArray(textBefore)) {
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
        suggestions: STEP_SCAFFOLDS.map((scaffold, index) => ({
          label: scaffold.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: scaffold.insertText,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          documentation: "Insert a step scaffold",
          sortText: String(index).padStart(3, "0"),
        })),
      }
    },
  })
}
