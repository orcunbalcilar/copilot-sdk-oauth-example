"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-primary/20 p-8 text-center sm:p-12 universe:border-purple-400/20"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 bg-card/30 backdrop-blur-xl universe:bg-black/40" />
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="mx-auto mb-6 size-12 text-primary" />
            </motion.div>
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
              Ready to Transform Your API Testing?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Start a conversation with our AI agents and create your first
              test suite in minutes.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block"
            >
              <Link
                href="/chat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageSquare className="h-5 w-5" />
                Start Testing Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
