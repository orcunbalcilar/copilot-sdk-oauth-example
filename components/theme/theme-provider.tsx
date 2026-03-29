"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

const THEME_CYCLE = ["light", "dark", "universe"] as const

function getNextTheme(current: string | undefined): string {
  const idx = THEME_CYCLE.indexOf(current as (typeof THEME_CYCLE)[number])
  return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
}

function ThemeProvider({
  children,
  ...props
}: Readonly<React.ComponentProps<typeof NextThemesProvider>>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={[...THEME_CYCLE, "system"]}
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function shouldIgnoreKeyEvent(event: KeyboardEvent): boolean {
  return (
    event.defaultPrevented ||
    event.repeat ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.key.toLowerCase() !== "d" ||
    isTypingTarget(event.target)
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreKeyEvent(event)) return
      setTheme(getNextTheme(resolvedTheme))
    }

    globalThis.addEventListener("keydown", onKeyDown)
    return () => globalThis.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider, THEME_CYCLE, getNextTheme }
