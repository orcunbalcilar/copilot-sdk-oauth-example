"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame, Send, Loader2, Zap, RotateCcw, LogOut } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
};

type ChatProps = {
  user: { name: string; image?: string | null };
  signOutAction: () => Promise<void>;
};

export function Chat({ user, signOutAction }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalUsage, setTotalUsage] = useState<TokenUsage>({
    inputTokens: 0,
    outputTokens: 0,
  });
  const [turnUsage, setTurnUsage] = useState<TokenUsage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setTurnUsage(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.reload();
          return;
        }
        throw new Error("Failed to send message");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === "session") {
              setSessionId(data.sessionId);
            } else if (data.type === "delta") {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            } else if (data.type === "usage") {
              const usage = {
                inputTokens: data.inputTokens,
                outputTokens: data.outputTokens,
              };
              setTurnUsage(usage);
              setTotalUsage((prev) => ({
                inputTokens: prev.inputTokens + usage.inputTokens,
                outputTokens: prev.outputTokens + usage.outputTokens,
              }));
            } else if (data.type === "error") {
              assistantContent += `\n\n⚠️ Error: ${data.message}`;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Something went wrong"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setSessionId(null);
    setTotalUsage({ inputTokens: 0, outputTokens: 0 });
    setTurnUsage(null);
  };

  const totalTokens = totalUsage.inputTokens + totalUsage.outputTokens;

  return (
    <div className="flex h-svh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-orange-500" />
          <h1 className="text-base font-semibold tracking-tight">
            Token Burner
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 font-mono text-xs tabular-nums"
            >
              <Zap className="size-3 text-amber-500" />
              {totalTokens.toLocaleString()} burned
            </Badge>
            {turnUsage && (
              <Badge
                variant="secondary"
                className="font-mono text-xs tabular-nums"
              >
                ↑{turnUsage.inputTokens.toLocaleString()} ↓
                {turnUsage.outputTokens.toLocaleString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                className="size-6 rounded-full"
              />
            )}
            <span className="text-xs text-muted-foreground">{user.name}</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleReset}>
            <RotateCcw className="size-3.5" />
          </Button>
          <form action={signOutAction}>
            <Button variant="ghost" size="icon-sm" type="submit">
              <LogOut className="size-3.5" />
            </Button>
          </form>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
              <Flame className="size-10 text-orange-500/40" />
              <div>
                <p className="text-sm font-medium">Ready to burn tokens</p>
                <p className="text-xs">
                  Send a message to start consuming your Copilot quota.
                </p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <Card
                size="sm"
                className={
                  msg.role === "user"
                    ? "max-w-[85%] border-0 bg-primary text-primary-foreground ring-0"
                    : "max-w-[85%]"
                }
              >
                <CardContent className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                  {msg.role === "assistant" && isLoading && i === messages.length - 1 && (
                    <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-current" />
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to burn tokens..."
            className="min-h-10 max-h-32 flex-1 resize-none"
            rows={1}
            disabled={isLoading}
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
