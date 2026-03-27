import { CopilotChat } from "@/components/copilot/chat";
import { Sparkles } from "lucide-react";

const suggestions = [
  "Import petstore.yaml and create a test plan",
  "Create a smoke test for the login endpoint",
  "Run all scenarios for the selected project",
  "Show me the project health summary",
];

export default function ChatPage() {
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
