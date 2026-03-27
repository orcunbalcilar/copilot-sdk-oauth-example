/**
 * Completion Providers — Orchestrator
 *
 * Registers all context-aware auto-completion providers
 * for RestFlow scenario editing.
 */

import type * as Monaco from "monaco-editor"
import {
  registerHandlebarsProvider,
  registerAssertionProvider,
  registerStepProvider,
} from "./snippet-completions"
import {
  registerHeaderNameProvider,
  registerHeaderValueProvider,
  registerStatusCodeProvider,
} from "./value-completions"

export function registerCompletionProviders(
  monaco: typeof Monaco,
): Monaco.IDisposable[] {
  const disposables: Monaco.IDisposable[] = []

  disposables.push(
    registerHandlebarsProvider(monaco),
    registerAssertionProvider(monaco),
    registerStepProvider(monaco),
    registerHeaderNameProvider(monaco),
    registerHeaderValueProvider(monaco),
    registerStatusCodeProvider(monaco),
  )

  return disposables
}
