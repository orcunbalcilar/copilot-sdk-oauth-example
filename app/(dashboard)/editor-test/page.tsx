"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Code2, GitCompare, Workflow } from "lucide-react"

import { SchemaEditor, SchemaDiffEditor, ScenarioFlow } from "@/components/editor"
import type { ValidationError } from "@/components/editor"

import { SAMPLE_SCENARIO, SAMPLE_SCENARIO_MODIFIED } from "./sample-data"

export default function EditorTestPage() {
  const [editorValue, setEditorValue] = useState(SAMPLE_SCENARIO)
  const [errors, setErrors] = useState<ValidationError[]>([])

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <SidebarTrigger />
        <Code2 className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Editor Playground</h1>
      </header>

      <div className="flex-1 min-h-0 flex flex-col p-4">
        <Tabs defaultValue="editor" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="mb-4 shrink-0">
            <TabsTrigger value="editor" className="gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="diff" className="gap-1.5">
              <GitCompare className="h-3.5 w-3.5" />
              Diff
            </TabsTrigger>
            <TabsTrigger value="flow" className="gap-1.5">
              <Workflow className="h-3.5 w-3.5" />
              Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 min-h-0">
            <EditorTab
              value={editorValue}
              errors={errors}
              onChange={setEditorValue}
              onValidationChange={setErrors}
            />
          </TabsContent>

          <TabsContent value="diff" className="flex-1 min-h-0">
            <DiffTab />
          </TabsContent>

          <TabsContent value="flow" className="flex-1 min-h-0">
            <FlowTab value={editorValue} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab content components                                             */
/* ------------------------------------------------------------------ */

function EditorTab(
  props: Readonly<{
    value: string
    errors: ValidationError[]
    onChange: (v: string) => void
    onValidationChange: (e: ValidationError[]) => void
  }>,
) {
  return (
    <div className="flex flex-col h-full gap-3">
      <p className="text-sm text-muted-foreground shrink-0">
        Full-featured JSON editor with schema validation, completions, and
        custom diagnostics.
      </p>
      <SchemaEditor
        value={props.value}
        onChange={props.onChange}
        onValidationChange={props.onValidationChange}
        resizable
      />
    </div>
  )
}

function DiffTab() {
  return (
    <div className="flex flex-col h-full gap-3">
      <p className="text-sm text-muted-foreground shrink-0">
        Side-by-side comparison of two scenario versions.
      </p>
      <SchemaDiffEditor
        original={SAMPLE_SCENARIO}
        modified={SAMPLE_SCENARIO_MODIFIED}
        height="100%"
        className="flex-1 min-h-0"
      />
    </div>
  )
}

function FlowTab(props: Readonly<{ value: string }>) {
  return (
    <div className="flex flex-col h-full gap-3">
      <p className="text-sm text-muted-foreground shrink-0">
        Interactive flow graph generated from the scenario JSON.
      </p>
      <div className="flex-1 min-h-0 rounded-lg border bg-muted/30">
        <ScenarioFlow value={props.value} />
      </div>
    </div>
  )
}
