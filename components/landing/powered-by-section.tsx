"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { y: 20, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true } as const,
  transition: { delay, duration: 0.5 },
});

function TechBadge({ children }: { readonly children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
}

export function PoweredBySection() {
  return (
    <section className="border-t border-border/50 py-24 universe:border-white/10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp(0)}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm">
              <GitBranch className="size-4 text-primary" />
              <span>Open Source Foundation</span>
            </div>
          </motion.div>
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            {...fadeUp(0.1)}
          >
            Powered by RestFlow
          </motion.h2>
          <motion.p
            className="mx-auto mb-8 max-w-2xl text-muted-foreground"
            {...fadeUp(0.2)}
          >
            RestFlowAI is built on top of RestFlow, a fluent Java DSL for API
            testing with structured steps, conditional execution, retries,
            timeouts, and rich assertions.
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            {...fadeUp(0.3)}
          >
            <TechBadge>Java 21+</TechBadge>
            <TechBadge>REST &amp; SOAP</TechBadge>
            <TechBadge>JSON Path</TechBadge>
            <TechBadge>XPath 3.1</TechBadge>
            <TechBadge>Retry &amp; Timeout</TechBadge>
            <TechBadge>SLF4J Observability</TechBadge>
          </motion.div>
          <motion.div className="mt-8" {...fadeUp(0.4)}>
            <Link
              href="https://github.com/orcunbalcilar/restflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary transition-colors hover:underline"
            >
              Explore RestFlow on GitHub
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
