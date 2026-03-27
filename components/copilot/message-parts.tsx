"use client"

import { MessageResponse } from "./message"
import {
  Reasoning,
  ReasoningContentDisplay,
  ReasoningTrigger,
} from "./reasoning"
import { SubagentDisplay } from "./subagent"
import { ToolDisplay } from "./tool"
import type { CopilotMessage, CopilotPart } from "./types"
import { UsageDisplay } from "./usage"

function renderPart(part: CopilotPart, key: string) {
  switch (part.type) {
    case "text":
      return <MessageResponse key={key}>{part.text}</MessageResponse>

    case "reasoning":
      return (
        <Reasoning className="w-full" part={part} key={key}>
          <ReasoningTrigger />
          <ReasoningContentDisplay>{part.text}</ReasoningContentDisplay>
        </Reasoning>
      )

    case "tool":
      return <ToolDisplay key={key} part={part} />

    case "usage":
      return <UsageDisplay key={key} usage={part} />

    case "subagent":
      return <SubagentDisplay key={key} part={part} />

    default:
      return null
  }
}

export type MessagePartsProps = Readonly<{
  message: CopilotMessage
}>

export function MessageParts({ message }: MessagePartsProps) {
  return (
    <>
      {message.parts.map((part, i) => renderPart(part, `${message.id}-${i}`))}
    </>
  )
}
