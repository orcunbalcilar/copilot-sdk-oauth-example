"use client";

import { motion } from "motion/react";

const fadeUp = (delay: number) => ({
  initial: { y: 20, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true } as const,
  transition: { delay, duration: 0.5 },
});

function StepCard(props: {
  readonly step: number;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="group text-center">
      <motion.div
        className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary font-mono text-lg font-bold text-primary-foreground"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {props.step}
      </motion.div>
      <h3 className="mb-2 text-lg font-semibold">{props.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {props.description}
      </p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="relative py-24">
      <div className="container relative mx-auto px-4">
        <motion.div className="mb-16 text-center" {...fadeUp(0)}>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three simple steps to production-ready API tests.
          </p>
        </motion.div>
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute top-7 left-[16.67%] right-[16.67%] hidden h-px bg-linear-to-r from-primary/30 via-primary/20 to-primary/30 md:block" />
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              <motion.div {...fadeUp(0.1)}>
                <StepCard
                  step={1}
                  title="Describe Your API"
                  description="Share a Swagger spec, paste cURL commands, or simply describe your API endpoints in natural language."
                />
              </motion.div>
              <motion.div {...fadeUp(0.2)}>
                <StepCard
                  step={2}
                  title="Review the Plan"
                  description="The AI analyzes your input and creates a comprehensive test plan. Review and approve before execution."
                />
              </motion.div>
              <motion.div {...fadeUp(0.3)}>
                <StepCard
                  step={3}
                  title="Get Your Tests"
                  description="Production-ready RestFlow test scenarios are generated, validated, and optionally executed. Export or run them directly."
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
