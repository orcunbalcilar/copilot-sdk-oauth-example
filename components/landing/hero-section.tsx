"use client"

import { ArrowRight, Bot, FileCode, MessageSquare } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"

const fadeUp = (delay: number) => ({
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { delay, duration: 0.6 },
})

function HeroCTAs() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 sm:flex-row"
      {...fadeUp(0.6)}
    >
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link
          href="/chat"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <MessageSquare className="h-5 w-5" />
          Start Testing with AI
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link
          href="https://github.com/orcunbalcilar/restflow"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border/50 bg-card/30 px-8 text-base font-medium transition-colors hover:bg-accent sm:w-auto"
        >
          <FileCode className="h-5 w-5" />
          View RestFlow DSL
        </Link>
      </motion.div>
    </motion.div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="relative container mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm">
              <Bot className="h-4 w-4 text-primary" />
              <span>Powered by Copilot SDK</span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            {...fadeUp(0.2)}
          >
            API Testing Reimagined with
            <br />
            <span className="bg-linear-to-r from-primary via-[oklch(0.627_0.265_303)] to-[oklch(0.696_0.17_162)] bg-clip-text text-transparent">
              AI Automation
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
            {...fadeUp(0.4)}
          >
            Create comprehensive API test suites in minutes, not hours.
            RestFlowAI uses intelligent agents to analyze your APIs, generate
            test plans, and execute scenarios — all through natural
            conversation.
          </motion.p>

          <HeroCTAs />

          <motion.div
            className="mx-auto mt-16 h-px w-2/3 max-w-md bg-linear-to-r from-transparent via-primary/30 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          />
        </div>
      </div>
    </section>
  )
}
