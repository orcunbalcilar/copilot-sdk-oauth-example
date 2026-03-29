"use client"

import { getNextTheme } from "@/components/theme/theme-provider"
import { Toggle } from "@/components/ui/toggle"
import { Atom, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle({ className }: { readonly className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Toggle
      variant="outline"
      size="sm"
      className={className}
      pressed={false}
      onPressedChange={() => setTheme(getNextTheme(resolvedTheme))}
      aria-label={`Switch theme (current: ${resolvedTheme})`}
    >
      <Sun className="h-4 w-4 dark:hidden universe:hidden" />
      <Moon className="hidden h-4 w-4 dark:block universe:hidden" />
      <Atom className="hidden h-4 w-4 universe:block" />
    </Toggle>
  )
}
