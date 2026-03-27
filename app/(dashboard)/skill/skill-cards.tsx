"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Terminal,
  FileText,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative bg-muted rounded-lg p-3 font-mono text-sm">
      <pre className="pr-10 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  )
}

const COPILOT_PROMPTS = [
  "@workspace I want to create a test case for my API using the restflow skill. Create a test that sends a GET request to https://api.example.com/users and verifies the response status code is 200.",
  "@workspace Using the restflow skill, create a CRUD test workflow for my User API at https://api.example.com/users.",
  "@workspace Using the restflow skill, help me debug this failing test scenario: [paste YAML]",
]

const CLAUDE_PROMPTS = [
  "Using the restflow skill, create a test scenario that validates the authentication flow for my API at https://api.example.com.",
  "Using the restflow skill, generate a comprehensive test suite for my REST API endpoints defined in this OpenAPI spec.",
  "Using the restflow skill, help me set up a multi-step test workflow with variable extraction between requests.",
]

const REFERENCE_FILES = [
  "schema-reference.md",
  "assertions.md",
  "http-methods.md",
  "authentication.md",
  "debugging.md",
  "flow-orchestration.md",
]

const EXAMPLE_FILES = [
  "simple-get.yaml",
  "post-with-auth.yaml",
  "crud-workflow.yaml",
  "ecommerce-flow.yaml",
  "retry-and-timeout.yaml",
  "oauth2-protected.yaml",
]

const ASSET_FILES = ["scenario-schema.json"]

export function CopilotUsageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          VS Code Copilot Chat
        </CardTitle>
        <CardDescription>
          Once installed, use these prompts with Copilot Chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {COPILOT_PROMPTS.map((prompt) => (
          <CodeBlock key={prompt.slice(0, 40)} code={prompt} />
        ))}
      </CardContent>
    </Card>
  )
}

export function ClaudeUsageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Claude Code
        </CardTitle>
        <CardDescription>
          Claude Code discovers skills in .agents/skills/ automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {CLAUDE_PROMPTS.map((prompt) => (
          <CodeBlock key={prompt.slice(0, 40)} code={prompt} />
        ))}
      </CardContent>
    </Card>
  )
}

function FileList({
  label,
  files,
  folder,
}: {
  label: string
  files: string[]
  folder: string
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file}
            className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-muted"
          >
            <span className="text-sm font-mono">{file}</span>
            <a
              href={`${API_URL}/api/skill/files/${folder}/${file}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export function IncludedFilesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Included Files
        </CardTitle>
        <CardDescription>
          Reference documentation and examples included with the skill
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileList
          label="References"
          files={REFERENCE_FILES}
          folder="references"
        />
        <FileList
          label="Examples"
          files={EXAMPLE_FILES}
          folder="examples"
        />
        <FileList label="Assets" files={ASSET_FILES} folder="assets" />
      </CardContent>
    </Card>
  )
}
