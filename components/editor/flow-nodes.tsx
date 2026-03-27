/**
 * Custom ReactFlow node components for scenario visualisation.
 */

"use client"

import { memo } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"

import { Badge } from "@/components/ui/badge"
import { METHOD_COLORS } from "./constants"
import type { HttpStepData, SetupStepData } from "./flow-conversion"

type HttpStepNode = Node<HttpStepData, "httpStep">
type SetupStepNode = Node<SetupStepData, "setupStep">

/* ------------------------------------------------------------------ */
/*  HTTP Step Node                                                     */
/* ------------------------------------------------------------------ */

function HttpStepNodeInner({ data }: Readonly<NodeProps<HttpStepNode>>) {
  const method = data.method.toLowerCase()
  const colors = METHOD_COLORS[method] ?? METHOD_COLORS.get

  return (
    <div
      className={`rounded-lg border px-3 py-2 shadow-sm bg-card min-w-48 ${colors.border}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className={`${colors.bg} ${colors.text} text-xs font-mono`}>
          {data.method}
        </Badge>
        <span className="text-xs font-medium truncate">{data.label}</span>
      </div>

      <p className="text-[11px] text-muted-foreground font-mono truncate">
        {data.url}
      </p>

      {data.assertionCount > 0 && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {data.assertionCount} assertion{data.assertionCount > 1 ? "s" : ""}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

export const HttpStepNode = memo(HttpStepNodeInner)

/* ------------------------------------------------------------------ */
/*  Setup Step Node                                                    */
/* ------------------------------------------------------------------ */

function SetupStepNodeInner({ data }: Readonly<NodeProps<SetupStepNode>>) {
  return (
    <div className="rounded-lg border border-dashed border-violet-500/40 px-3 py-2 shadow-sm bg-card min-w-48">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="bg-violet-500/10 text-violet-600 text-xs">
          Setup
        </Badge>
        <span className="text-xs font-medium truncate">{data.label}</span>
      </div>

      {data.variableCount > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {data.variableCount} variable{data.variableCount > 1 ? "s" : ""}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}

export const SetupStepNode = memo(SetupStepNodeInner)

/* ------------------------------------------------------------------ */
/*  Node type registry                                                 */
/* ------------------------------------------------------------------ */

export const nodeTypes = {
  httpStep: HttpStepNode,
  setupStep: SetupStepNode,
}
