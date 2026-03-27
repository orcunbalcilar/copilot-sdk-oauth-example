/**
 * ScenarioFlow — ReactFlow visualisation of a RestFlow scenario.
 *
 * Parses JSON from the editor and renders an interactive
 * directed graph of HTTP / setup steps.
 */

"use client"

import { useEffect, useMemo } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { scenarioToFlow } from "./flow-conversion"
import { nodeTypes } from "./flow-nodes"

/* ------------------------------------------------------------------ */
/*  Public props                                                       */
/* ------------------------------------------------------------------ */

export interface ScenarioFlowProps {
  /** Scenario JSON string to visualise */
  value: string
  /** Additional class names on the wrapper */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Inner component (must be inside ReactFlowProvider)                 */
/* ------------------------------------------------------------------ */

function ScenarioFlowInner({ value, className }: Readonly<ScenarioFlowProps>) {
  const { nodes: parsed, edges: parsedEdges } = useMemo(
    () => scenarioToFlow(value),
    [value],
  )

  const [nodes, , onNodesChange] = useNodesState<Node>(parsed)
  const [edges, , onEdgesChange] = useEdgesState<Edge>(parsedEdges)
  const { fitView } = useReactFlow()
  const isEmpty = parsed.length === 0

  useEffect(() => {
    // fit after a tick so layout has settled
    requestAnimationFrame(() => {
      fitView({ padding: 0.2 })
    })
  }, [value, fitView])

  const proOptions = useMemo(() => ({ hideAttribution: true }), [])

  if (isEmpty) {
    return (
      <div
        className={`flex items-center justify-center h-full text-sm text-muted-foreground ${className ?? ""}`}
      >
        No steps to visualise
      </div>
    )
  }

  return (
    <div className={`h-full w-full ${className ?? ""}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.3}
        maxZoom={1.5}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Public wrapper (provides ReactFlow context)                        */
/* ------------------------------------------------------------------ */

export function ScenarioFlow(props: Readonly<ScenarioFlowProps>) {
  return (
    <ReactFlowProvider>
      <ScenarioFlowInner {...props} />
    </ReactFlowProvider>
  )
}
