"use client";

import { CopilotChat } from "@/components/copilot/chat";
import { useProject } from "@/lib/project-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Sparkles } from "lucide-react";
import Link from "next/link";

const suggestions = [
  "Import petstore.yaml and create a test plan",
  "Create a smoke test for the login endpoint",
  "Run all scenarios for the selected project",
  "Show me the project health summary",
];

export default function ChatPage() {
  const { selectedProject } = useProject();

  if (!selectedProject) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No project selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a project from the sidebar or create one to start chatting.
            </p>
            <Button render={<Link href="/projects" />}>
              Go to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CopilotChat
      title="RestFlowAI"
      icon={<Sparkles className="size-5 text-primary" />}
      placeholder="Describe your API or testing needs..."
      emptyDescription="Ask me to import APIs, generate test plans, run scenarios, or debug failures."
      suggestions={suggestions}
    />
  );
}
