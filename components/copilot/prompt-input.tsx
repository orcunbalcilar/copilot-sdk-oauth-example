"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { CornerDownLeftIcon, SquareIcon } from "lucide-react";
import type {
  ComponentProps,
  HTMLAttributes,
  KeyboardEvent,
} from "react";
import { useCallback, useRef } from "react";

import type { CopilotChatStatus } from "./types";

// ----- PromptInput (form container) -----

export type PromptInputProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  onSubmit: () => void;
};

export const PromptInput = ({
  className,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const handleSubmit = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit],
  );

  return (
    <form
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-background p-2 shadow-sm",
        className,
      )}
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </form>
  );
};

// ----- PromptInputBody -----

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({
  className,
  ...props
}: PromptInputBodyProps) => (
  <div className={cn("flex items-start gap-2", className)} {...props} />
);

// ----- PromptInputTextarea -----

export type PromptInputTextareaProps = ComponentProps<"textarea">;

export const PromptInputTextarea = ({
  className,
  onKeyDown,
  ...props
}: PromptInputTextareaProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    [onKeyDown],
  );

  const setRef = useCallback((el: HTMLTextAreaElement | null) => {
    if (el) {
      formRef.current = el.closest("form");
    }
  }, []);

  return (
    <textarea
      ref={setRef}
      className={cn(
        "field-sizing-content max-h-40 min-h-10 flex-1 resize-none border-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground",
        className,
      )}
      onKeyDown={handleKeyDown}
      rows={1}
      {...props}
    />
  );
};

// ----- PromptInputFooter -----

export type PromptInputFooterProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputFooter = ({
  className,
  ...props
}: PromptInputFooterProps) => (
  <div
    className={cn("flex items-center justify-between gap-2", className)}
    {...props}
  />
);

// ----- PromptInputTools -----

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div className={cn("flex items-center gap-1.5", className)} {...props} />
);

// ----- PromptInputSubmit -----

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status: CopilotChatStatus;
  onStop?: () => void;
};

export function PromptInputSubmit({
  status,
  onStop,
  className,
  ...props
}: PromptInputSubmitProps) {
  const isActive = status === "streaming" || status === "submitted";

  if (isActive) {
    return (
      <Button
        className={cn("ml-auto", className)}
        onClick={onStop}
        size="icon-sm"
        type="button"
        variant="outline"
        {...props}
      >
        {status === "submitted" ? (
          <Spinner className="size-3.5" />
        ) : (
          <SquareIcon className="size-3.5" />
        )}
      </Button>
    );
  }

  return (
    <Button
      className={cn("ml-auto", className)}
      size="icon-sm"
      type="submit"
      {...props}
    >
      <CornerDownLeftIcon className="size-3.5" />
    </Button>
  );
}
