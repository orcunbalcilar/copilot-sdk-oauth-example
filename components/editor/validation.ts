/**
 * Validation Module
 *
 * Custom validation rules that complement Monaco's built-in JSON Schema validation.
 * Monaco handles structural validation (types, required fields, enums) via the
 * registered JSON Schema. This module adds domain-specific checks:
 * - Status code range validation (100-599)
 * - Missing assertions warnings
 * - GET/DELETE/HEAD with body warnings
 */

import type * as Monaco from "monaco-editor"
import { parseTree } from "jsonc-parser"

import { addMarker, type ValidationCtx } from "./validation-helpers"
export type { ValidationError } from "./validation-helpers"
export { markersToErrors } from "./validation-helpers"

const MIN_STATUS_CODE = 100
const MAX_STATUS_CODE = 599

/**
 * Run custom validation checks and return markers.
 */
export function validateScenario(
  jsonText: string,
  monaco: typeof Monaco,
): { errors: import("./validation-helpers").ValidationError[]; markers: Monaco.editor.IMarkerData[] } {
  const errors: import("./validation-helpers").ValidationError[] = []
  const markers: Monaco.editor.IMarkerData[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    const parseError = e instanceof SyntaxError ? e.message : "Invalid JSON"
    const marker: Monaco.editor.IMarkerData = {
      severity: monaco.MarkerSeverity.Error,
      message: `Invalid JSON: ${parseError}. Check for missing commas, brackets, or quotes`,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
      source: "restflow",
    }
    markers.push(marker)
    errors.push({
      message: marker.message,
      path: "",
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 1,
      severity: "error",
    })
    return { errors, markers }
  }

  const tree = parseTree(jsonText)
  if (!parsed || typeof parsed !== "object" || !("steps" in parsed)) {
    return { errors, markers }
  }

  const scenario = parsed as { steps?: unknown[] }
  if (!Array.isArray(scenario.steps)) return { errors, markers }

  const ctx: ValidationCtx = { jsonText, tree, monaco, errors, markers }

  for (let i = 0; i < scenario.steps.length; i++) {
    const step = scenario.steps[i]
    if (!step || typeof step !== "object" || !("http" in step)) continue
    const http = (step as { http: Record<string, unknown> }).http
    if (!http || typeof http !== "object") continue

    const method =
      typeof http.method === "string" ? http.method.toLowerCase() : ""

    validateAssertions(http, i, ctx)
    validateNoAssertions(http, i, ctx)
    validateBodyOnSafeMethod(http, method, i, ctx)
  }

  return { errors, markers }
}

function validateStatusCode(
  assertion: Record<string, unknown>,
  stepIdx: number,
  j: number,
  ctx: ValidationCtx,
) {
  if (
    assertion.type !== "statusCode" ||
    typeof assertion.value !== "number"
  )
    return
  if (
    assertion.value < MIN_STATUS_CODE ||
    assertion.value > MAX_STATUS_CODE
  ) {
    addMarker(
      `Invalid status code ${assertion.value}. HTTP status codes must be between ${MIN_STATUS_CODE} and ${MAX_STATUS_CODE}`,
      ["steps", stepIdx, "http", "assertions", j, "value"],
      ctx,
      "error",
    )
  }
}

function validateStatusCodeIn(
  assertion: Record<string, unknown>,
  stepIdx: number,
  j: number,
  ctx: ValidationCtx,
) {
  if (
    assertion.type !== "statusCodeIn" ||
    !Array.isArray(assertion.values)
  )
    return
  for (const code of assertion.values) {
    if (
      typeof code === "number" &&
      (code < MIN_STATUS_CODE || code > MAX_STATUS_CODE)
    ) {
      addMarker(
        `Invalid status code ${code} in values array. HTTP status codes must be between ${MIN_STATUS_CODE} and ${MAX_STATUS_CODE}`,
        ["steps", stepIdx, "http", "assertions", j, "values"],
        ctx,
        "error",
      )
      break
    }
  }
}

function validateResponseTime(
  assertion: Record<string, unknown>,
  stepIdx: number,
  j: number,
  ctx: ValidationCtx,
) {
  if (
    assertion.type === "responseTimeMax" &&
    typeof assertion.value === "number" &&
    assertion.value <= 0
  ) {
    addMarker(
      `Response time max must be a positive number (got ${assertion.value})`,
      ["steps", stepIdx, "http", "assertions", j, "value"],
      ctx,
      "error",
    )
  }
}

function validateAssertions(
  http: Record<string, unknown>,
  stepIdx: number,
  ctx: ValidationCtx,
) {
  if (!Array.isArray(http.assertions)) return
  for (let j = 0; j < http.assertions.length; j++) {
    const assertion = http.assertions[j] as
      | Record<string, unknown>
      | undefined
    if (!assertion) continue

    validateStatusCode(assertion, stepIdx, j, ctx)
    validateStatusCodeIn(assertion, stepIdx, j, ctx)
    validateResponseTime(assertion, stepIdx, j, ctx)
  }
}

function validateNoAssertions(
  http: Record<string, unknown>,
  stepIdx: number,
  ctx: ValidationCtx,
) {
  if (
    !http.assertions ||
    (Array.isArray(http.assertions) && http.assertions.length === 0)
  ) {
    const stepName =
      typeof http.name === "string" ? http.name : `step ${String(stepIdx + 1)}`
    addMarker(
      `HTTP step "${stepName}" has no assertions — the step will execute but nothing will be validated`,
      ["steps", stepIdx, "http"],
      ctx,
      "warning",
    )
  }
}

function validateBodyOnSafeMethod(
  http: Record<string, unknown>,
  method: string,
  stepIdx: number,
  ctx: ValidationCtx,
) {
  if (http.body && ["get", "delete", "head"].includes(method)) {
    addMarker(
      `${method.toUpperCase()} requests typically do not include a body`,
      ["steps", stepIdx, "http", "body"],
      ctx,
      "warning",
    )
  }
}
