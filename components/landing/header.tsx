"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "next-themes";
import { Moon, Sun, Sparkles } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">RestFlowAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/orcunbalcilar/restflow"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
          <Toggle
            variant="outline"
            size="sm"
            className="size-9"
            pressed={theme === "dark"}
            onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
            aria-label="Toggle dark mode"
          >
            <Moon className="hidden dark:block h-4 w-4" />
            <Sun className="dark:hidden h-4 w-4" />
          </Toggle>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/chat"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>
    </motion.header>
  );
}
