/**
 * Scenario → ReactFlow graph conversion
 *
 * Parses a RestFlow scenario JSON and produces
 * positioned nodes + edges for the flow visualisation.
 */

import type { Edge, Node } from "@xyflow/react"

/* ------------------------------------------------------------------ */
/*  Domain types                                                       */
/* ------------------------------------------------------------------ */

export interface ScenarioStep {
  http?: {
    name: string
    method: string
    url: string
    assertions?: Array<{ type: string }>
  }
  setup?: {
    name: string
    contextValues?: Record<string, unknown>
  }
}

interface Scenario {
  name?: string
  steps?: ScenarioStep[]
}

export interface HttpStepData {
  [key: string]: unknown
  label: string
  method: string
  url: string
  assertionCount: number
  stepIndex: number
}

export interface SetupStepData {
  [key: string]: unknown
  label: string
  variableCount: number
  stepIndex: number
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const NODE_SPACING_Y = 110
const NODE_X = 50

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MAX_URL_LENGTH = 40

export function truncateUrl(url: string): string {
  if (url.length <= MAX_URL_LENGTH) return url
  return `${url.slice(0, MAX_URL_LENGTH)}…`
}

/* ------------------------------------------------------------------ */
/*  Conversion                                                         */
/* ------------------------------------------------------------------ */

export function scenarioToFlow(json: string): {
  nodes: Node[]
  edges: Edge[]
} {
  const empty = { nodes: [], edges: [] }

  let scenario: Scenario
  try {
    scenario = JSON.parse(json) as Scenario
  } catch {
    return empty
  }

  const steps = scenario.steps
  if (!Array.isArray(steps) || steps.length === 0) return empty

  const nodes: Node[] = []
  const edges: Edge[] = []

  for (const [index, step] of steps.entries()) {
    const id = `step-${String(index)}`
    const y = index * NODE_SPACING_Y

    if (step.http) {
      const data: HttpStepData = {
        label: step.http.name,
        method: step.http.method.toUpperCase(),
        url: truncateUrl(step.http.url),
        assertionCount: step.http.assertions?.length ?? 0,
        stepIndex: index,
      }
      nodes.push({
        id,
        type: "httpStep",
        position: { x: NODE_X, y },
        data,
      })
    } else if (step.setup) {
      const data: SetupStepData = {
        label: step.setup.name,
        variableCount: Object.keys(step.setup.contextValues ?? {}).length,
        stepIndex: index,
      }
      nodes.push({
        id,
        type: "setupStep",
        position: { x: NODE_X, y },
        data,
      })
    }

    if (index > 0) {
      edges.push({
        id: `e-${String(index - 1)}-${String(index)}`,
        source: `step-${String(index - 1)}`,
        target: id,
        type: "smoothstep",
        animated: true,
      })
    }
  }

  return { nodes, edges }
}
