/**
 * useSchemaEditor Hook
 *
 * Manages Monaco editor lifecycle: JSON Schema registration,
 * custom validation, completion providers, theme, and resize.
 */

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type * as Monaco from "monaco-editor"
import { restflowScenarioJsonSchema } from "./restflow-json-schema"
import { registerCompletionProviders } from "./completions"
import {
  validateScenario,
  markersToErrors,
  type ValidationError,
} from "./validation"
import { detectLanguage, type EditorLanguage } from "./language-detection"
import { EDITOR_DEFAULTS } from "./constants"
import { defineRestflowThemes, applyCurrentTheme } from "./editor-themes"

interface UseSchemaEditorOptions {
  initialValue: string
  onChange?: (value: string) => void
  onValidationChange?: (errors: ValidationError[]) => void
  onLanguageChange?: (language: EditorLanguage) => void
  language?: EditorLanguage
  readOnly?: boolean
}

export function useSchemaEditor(options: UseSchemaEditorOptions) {
  const {
    initialValue,
    onChange,
    onValidationChange,
    onLanguageChange,
    language: languageProp,
    readOnly,
  } = options

  const [errors, setErrors] = useState<ValidationError[]>([])
  const [detectedLanguage, setDetectedLanguage] = useState<EditorLanguage>(
    languageProp ?? detectLanguage(initialValue),
  )
  const [editorHeight, setEditorHeight] = useState(() => {
    if (globalThis.window === undefined) return EDITOR_DEFAULTS.height
    const stored = localStorage.getItem("restflow-editor-height")
    return stored ? Number(stored) : EDITOR_DEFAULTS.height
  })

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const disposablesRef = useRef<Monaco.IDisposable[]>([])
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const schemaRegisteredRef = useRef(false)

  const updateHeight = useCallback((height: number) => {
    const clamped = Math.max(
      EDITOR_DEFAULTS.minHeight,
      Math.min(EDITOR_DEFAULTS.maxHeight, height),
    )
    setEditorHeight(clamped)
    localStorage.setItem("restflow-editor-height", String(clamped))
  }, [])

  const syncErrorsFromMarkers = useCallback(
    (monaco: typeof Monaco, model: Monaco.editor.ITextModel) => {
      if (readOnly) return
      const allMarkers = monaco.editor.getModelMarkers({
        resource: model.uri,
      })
      const allErrors = markersToErrors(allMarkers)
      setErrors(allErrors)
      onValidationChange?.(allErrors)
    },
    [readOnly, onValidationChange],
  )

  const handleBeforeMount = useCallback((monaco: typeof Monaco) => {
    monacoRef.current = monaco

    if (!schemaRegisteredRef.current) {
      registerJsonSchema(monaco)
      defineRestflowThemes(monaco)
      schemaRegisteredRef.current = true
    }

    disposablesRef.current = registerCompletionProviders(monaco)
  }, [])

  const runValidation = useCallback(
    (value: string, monaco: typeof Monaco) => {
      if (readOnly) return
      if (detectLanguage(value) !== "json") return

      const { markers } = validateScenario(value, monaco)
      const model = editorRef.current?.getModel()
      if (model) {
        monaco.editor.setModelMarkers(model, "restflow", markers)
      }
    },
    [readOnly],
  )

  const handleMount = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      applyCurrentTheme(monaco)
      configureEditor(editor, readOnly)

      if (!readOnly) {
        const markerDisposable = monaco.editor.onDidChangeMarkers(
          ([resource]) => {
            const model = editor.getModel()
            if (resource.toString() === model?.uri.toString()) {
              syncErrorsFromMarkers(monaco, model)
            }
          },
        )
        disposablesRef.current.push(markerDisposable)
        runValidation(editor.getValue(), monaco)
      }
    },
    [readOnly, syncErrorsFromMarkers, runValidation],
  )

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!value) return
      onChange?.(value)

      const detected = detectLanguage(value)
      if (detected !== detectedLanguage) {
        setDetectedLanguage(detected)
        onLanguageChange?.(detected)
        if (editorRef.current && monacoRef.current) {
          const model = editorRef.current.getModel()
          if (model) {
            monacoRef.current.editor.setModelLanguage(model, detected)
          }
        }
      }

      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current)
      }
      validationTimerRef.current = setTimeout(() => {
        if (monacoRef.current) {
          runValidation(value, monacoRef.current)
        }
      }, EDITOR_DEFAULTS.validationDebounceMs)
    },
    [onChange, onLanguageChange, detectedLanguage, runValidation],
  )

  const formatDocument = useCallback(() => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run()
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (monacoRef.current) {
        applyCurrentTheme(monacoRef.current)
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    return () => {
      for (const d of disposablesRef.current) {
        d.dispose()
      }
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current)
      }
    }
  }, [])

  return {
    errors,
    detectedLanguage,
    editorHeight,
    updateHeight,
    handleBeforeMount,
    handleMount,
    handleChange,
    formatDocument,
    editorRef,
    monacoRef,
  }
}

function registerJsonSchema(monaco: typeof Monaco) {
  type JsonLangApi = {
    jsonDefaults?: {
      setDiagnosticsOptions: (opts: unknown) => void
    }
  }
  const jsonLang =
    (monaco as unknown as { json?: JsonLangApi }).json ??
    (monaco.languages as unknown as { json?: JsonLangApi }).json
  jsonLang?.jsonDefaults?.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    trailingCommas: "error",
    schemas: [
      {
        uri: "https://restflow.dev/schemas/scenario.json",
        fileMatch: ["*"],
        schema: restflowScenarioJsonSchema as Record<string, unknown>,
      },
    ],
  })
}

function configureEditor(
  editor: Monaco.editor.IStandaloneCodeEditor,
  readOnly?: boolean,
) {
  editor.updateOptions({
    formatOnPaste: true,
    formatOnType: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    renderLineHighlight: "line",
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    folding: true,
    foldingStrategy: "indentation",
    wordWrap: "on",
    tabSize: 2,
    readOnly: readOnly ?? false,
    smoothScrolling: true,
    cursorSmoothCaretAnimation: "on",
    padding: { top: 12, bottom: 12 },
    fontFamily:
      "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 13,
    lineHeight: 20,
  })
}
