"use client"

import { ContextUsage } from "./context-usage"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./conversation"
import { Intent } from "./intent"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "./message"
import { MessageParts } from "./message-parts"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "./prompt-input"
import { Suggestion, Suggestions } from "./suggestion"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import type { UseCopilotChatOptions } from "@/hooks/use-copilot-chat"
import { useCopilotChat } from "@/hooks/use-copilot-chat"
import { useModelSettings } from "@/hooks/use-model-settings"
import { DEFAULT_MODEL_SETTINGS } from "@/lib/chat-settings"
import { CopyIcon, RefreshCcwIcon, RotateCcw } from "lucide-react"
import type { ReactNode } from "react"
import { Fragment, useState } from "react"
import { ModelSelector } from "./model-selector"
import { SkillSelector } from "./skill-selector"

// ----- Types -----

export interface CopilotChatProps {
  /** App title displayed in header */
  readonly title?: string
  /** Icon shown in header and empty state */
  readonly icon?: ReactNode
  /** Placeholder text for the input */
  readonly placeholder?: string
  /** Empty state description */
  readonly emptyDescription?: string
  /** Suggestion prompts shown when no messages */
  readonly suggestions?: string[]
  /** Options passed to useCopilotChat hook */
  readonly chatOptions?: UseCopilotChatOptions
}

export function CopilotChat(props: CopilotChatProps) {
  const {
    title = "Chat",
    icon,
    placeholder = "Type a message...",
    emptyDescription = "Send a message to start a conversation.",
    suggestions = [],
    chatOptions,
  } = props

  const ms = useModelSettings(DEFAULT_MODEL_SETTINGS)

  const {
    messages,
    status,
    intent,
    contextUsage,
    sessionTitle,
    sendMessage,
    stop,
    resetSession,
  } = useCopilotChat({
    ...chatOptions,
    providerId: ms.settings.providerId,
    modelId: ms.settings.modelId,
  })

  const [input, setInput] = useState("")

  const handleSubmit = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput("")
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {icon}
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          {sessionTitle && (
            <span className="max-w-50 truncate text-xs text-muted-foreground">
              — {sessionTitle}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={resetSession}>
          <RotateCcw className="size-3.5" />
        </Button>
      </header>

      <Conversation>
        <ConversationContent className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
          {messages.length === 0 ? (
            <>
              <ConversationEmptyState
                icon={icon}
                title={`Ready to ${title.toLowerCase()}`}
                description={emptyDescription}
              />
              {suggestions.length > 0 && (
                <Suggestions className="mx-auto">
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s}
                      suggestion={s}
                      onClick={handleSuggestionClick}
                    />
                  ))}
                </Suggestions>
              )}
            </>
          ) : (
            messages.map((message, index) => (
              <Fragment key={message.id}>
                <Message from={message.role}>
                  <MessageContent>
                    <MessageParts message={message} />
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
                            .filter(
                              (p): p is Extract<typeof p, { type: "text" }> =>
                                p.type === "text"
                            )
                            .map((p) => p.text)
                            .join("\n")
                          void navigator.clipboard.writeText(text)
                        }}
                      >
                        <CopyIcon className="size-3" />
                      </MessageAction>
                      <MessageAction
                        label="Regenerate"
                        onClick={() => {
                          const lastUser = messages.findLast(
                            (m) => m.role === "user"
                          )
                          const userText = lastUser?.parts.find(
                            (p) => p.type === "text"
                          )
                          if (userText?.type === "text") {
                            sendMessage(userText.text)
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
            <Intent intent={intent} />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-4 py-3">
        {contextUsage && (
          <ContextUsage
            usage={contextUsage}
            className="mx-auto mb-2 max-w-3xl"
          />
        )}
        <PromptInput onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <ModelSelector
                providers={ms.providers}
                settings={ms.settings}
                onSettingsChange={ms.updateSettings}
                isLoading={ms.isLoading}
                error={ms.error}
              />
              <SkillSelector />
            </PromptInputTools>
            <PromptInputSubmit
              status={status === "error" ? "error" : status}
              onStop={stop}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
