"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  Apple,
  Monitor,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

interface SkillInfo {
  name: string
  version: string
  description: string
  files: string[]
}

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

function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div
      className={`relative bg-muted rounded-lg p-3 font-mono text-sm ${className ?? ""}`}
    >
      <pre className="pr-10 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  )
}

function UnixInstall() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Project-level</label>
        <CodeBlock
          code={`curl -fsSL ${API_URL}/api/skill/install | bash`}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Global</label>
        <CodeBlock
          code={`curl -fsSL ${API_URL}/api/skill/install | bash -s -- --global`}
        />
      </div>
    </div>
  )
}

function WindowsInstall() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Project-level</label>
        <CodeBlock
          code={`irm ${API_URL}/api/skill/install.ps1 | iex`}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Global</label>
        <CodeBlock
          code={`$env:RESTFLOW_SCOPE="global"; irm ${API_URL}/api/skill/install.ps1 | iex`}
        />
      </div>
    </div>
  )
}

function InstallCard() {
  const [platform, setPlatform] = useState<"unix" | "windows">("unix")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Quick Install
        </CardTitle>
        <CardDescription>
          Copy a command and run it in your terminal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={platform === "unix" ? "default" : "outline"}
            size="sm"
            onClick={() => setPlatform("unix")}
          >
            <Apple className="h-4 w-4 mr-2" />
            macOS/Linux
          </Button>
          <Button
            variant={platform === "windows" ? "default" : "outline"}
            size="sm"
            onClick={() => setPlatform("windows")}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Windows
          </Button>
        </div>
        {platform === "unix" ? <UnixInstall /> : <WindowsInstall />}
      </CardContent>
    </Card>
  )
}

function StatusCard({
  skillAvailable,
  skillInfo,
}: {
  skillAvailable: boolean | null
  skillInfo: SkillInfo | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Skill Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skillAvailable === null ? (
          <p className="text-sm text-muted-foreground">
            Checking skill availability...
          </p>
        ) : skillAvailable ? (
          <div className="space-y-3">
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/10">
              Available
            </Badge>
            {skillInfo && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{skillInfo.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">{skillInfo.version}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Files</p>
                  <p className="font-medium">{skillInfo.files.length}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Unavailable</Badge>
            <span className="text-sm text-muted-foreground">
              Skill API is not reachable at {API_URL}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import {
  CopilotUsageCard,
  ClaudeUsageCard,
  IncludedFilesCard,
} from "./skill-cards"

export default function SkillPage() {
  const [skillInfo, setSkillInfo] = useState<SkillInfo | null>(null)
  const [skillAvailable, setSkillAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchSkillInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/skill/info`)
        if (res.ok) {
          const data = await res.json()
          setSkillInfo(data)
          setSkillAvailable(true)
        } else {
          setSkillAvailable(false)
        }
      } catch {
        setSkillAvailable(false)
      }
    }
    fetchSkillInfo()
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Agent Skill</h1>
            <p className="text-sm text-muted-foreground">
              Install RestFlow skill for your coding agents
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <InstallCard />
          <StatusCard
            skillAvailable={skillAvailable}
            skillInfo={skillInfo}
          />
          <CopilotUsageCard />
          <ClaudeUsageCard />
          <IncludedFilesCard />
        </div>
      </div>
    </div>
  )
}
