"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageParts } from "./message-parts";
import {
  Flame,
  RotateCcw,
  LogOut,
  CopyIcon,
  RefreshCcwIcon,
  DatabaseIcon,
} from "lucide-react";
import Image from "next/image";
import { useState, Fragment } from "react";

const suggestions = [
  "Explain how token prediction works in LLMs",
  "Write a TypeScript function to debounce API calls",
  "What are the key differences between HTTP/2 and HTTP/3?",
];

function contextUsageColor(ctx: { currentTokens: number; tokenLimit: number }) {
  const pct = (ctx.currentTokens / ctx.tokenLimit) * 100;
  if (pct > 80) return "bg-red-500";
  if (pct > 60) return "bg-yellow-500";
  return "bg-green-500";
}

type ChatProps = Readonly<{
  user: { name: string; image?: string | null };
  signOutAction: () => Promise<void>;
}>;

export function Chat({ user, signOutAction }: ChatProps) {
  const [intent, setIntent] = useState<string | null>(null);
  const [contextUsage, setContextUsage] = useState<{
    tokenLimit: number;
    currentTokens: number;
    messagesLength: number;
  } | null>(null);
  const [toolProgress, setToolProgress] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const {
    messages,
    status,
    sendMessage,
    stop,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onData: ({ type, data }: { type: string; data: unknown }) => {
      if (type === "data-intent") {
        setIntent((data as { intent: string }).intent);
      }
      if (type === "data-context-usage") {
        setContextUsage(
          data as { tokenLimit: number; currentTokens: number; messagesLength: number },
        );
      }
      if (type === "data-tool-progress") {
        setToolProgress((data as { progressMessage: string }).progressMessage);
      }
      if (type === "data-title") {
        setSessionTitle((data as { title: string }).title);
      }
    },
    onFinish: () => {
      setIntent(null);
      setToolProgress(null);
    },
  });
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    setIntent(null);
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setIntent(null);
    sendMessage({ text: suggestion });
  };

  return (
    <div className="flex h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame className="size-5 text-orange-500" />
          <h1 className="text-base font-semibold tracking-tight">
            Token Burner
          </h1>
          {sessionTitle && (
            <span className="text-xs text-muted-foreground truncate max-w-50">
              — {sessionTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name}
                width={24}
                height={24}
                className="size-6 rounded-full"
              />
            )}
            <span className="text-xs text-muted-foreground">{user.name}</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => {
            setMessages([]);
            setContextUsage(null);
            setSessionTitle(null);
          }}>            <RotateCcw className="size-3.5" />
          </Button>
          <form action={signOutAction}>
            <Button variant="ghost" size="icon-sm" type="submit">
              <LogOut className="size-3.5" />
            </Button>
          </form>
        </div>
      </header>

      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<Flame className="size-10 text-orange-500/40" />}
              title="Ready to burn tokens"
              description="Send a message to start consuming your Copilot quota."
            >
              <Suggestions className="mt-4">
                {suggestions.map((s) => (
                  <Suggestion
                    key={s}
                    suggestion={s}
                    onClick={handleSuggestionClick}
                  />
                ))}
              </Suggestions>
            </ConversationEmptyState>
          ) : (
            messages.map((message, index) => (
              <Fragment key={message.id}>
                <Message from={message.role === "system" ? "assistant" : message.role}>
                  <MessageContent>
                    <MessageParts
                      message={message}
                      isLastMessage={index === messages.length - 1}
                      status={status}
                    />
                  </MessageContent>
                </Message>
                {message.role === "assistant" &&
                  index === messages.length - 1 &&
                  status === "ready" &&
                  message.parts.some((p) => p.type === "text") && (
                    <MessageActions>
                      <MessageAction
                        label="Copy"
                        onClick={() => {
                          const text = message.parts
                            .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
                            .map((p) => p.text)
                            .join("\n");
                          navigator.clipboard.writeText(text);
                        }}
                      >
                        <CopyIcon className="size-3" />
                      </MessageAction>
                      <MessageAction
                        label="Regenerate"
                        onClick={() => {
                          const lastUser = messages.findLast(
                            (m) => m.role === "user",
                          );
                          const userText = lastUser?.parts.find(
                            (p) => p.type === "text",
                          );
                          if (userText?.type === "text") {
                            sendMessage({ text: userText.text });
                          }
                        }}
                      >
                        <RefreshCcwIcon className="size-3" />
                      </MessageAction>
                    </MessageActions>
                  )}
              </Fragment>
            ))
          )}
          {status === "submitted" && <Spinner />}
          {intent && (status === "streaming" || status === "submitted") && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Spinner className="size-3" />
              <span>{intent}</span>
            </div>
          )}
          {toolProgress && (status === "streaming" || status === "submitted") && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
              <span className="inline-block size-2 rounded-full bg-blue-500" />
              <span>{toolProgress}</span>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-4 py-3">
        {contextUsage && (
          <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 text-xs text-muted-foreground">
            <DatabaseIcon className="size-3" />
            <span>Context:</span>
            <div className="h-1.5 flex-1 max-w-30 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${contextUsageColor(contextUsage)}`}
                style={{ width: `${Math.min((contextUsage.currentTokens / contextUsage.tokenLimit) * 100, 100)}%` }} // eslint-disable-line react/forbid-dom-props
              />
            </div>
            <span>
              {contextUsage.currentTokens.toLocaleString()} / {contextUsage.tokenLimit.toLocaleString()}
            </span>
            <span className="text-muted-foreground/60">({contextUsage.messagesLength} msgs)</span>
          </div>
        )}
        <PromptInput
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl"
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to burn tokens..."
              autoFocus
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              status={status === "error" ? "error" : status}
              onStop={stop}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
