"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface FeatureCardProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly title: string;
  readonly description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      className="group rounded-xl border border-border/50 bg-card/30 p-6 transition-colors hover:border-primary/30 hover:bg-card/60"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Icon className="size-6 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}

const features: FeatureCardProps[] = [
  {
    icon: Bot,
    title: "Multi-Agent Intelligence",
    description:
      "Intelligent agents work together to understand your needs, create test plans, and generate production-ready test scenarios.",
  },
  {
    icon: MessageSquare,
    title: "Conversational Interface",
    description:
      "Describe your testing needs in plain English. Paste Swagger specs, cURL commands, or just explain what you want to test.",
  },
  {
    icon: CheckCircle2,
    title: "Plan Approval Workflow",
    description:
      "Review and approve test plans before execution. Provide feedback to refine scenarios to match your exact requirements.",
  },
  {
    icon: Zap,
    title: "RestFlow DSL",
    description:
      "Built on RestFlow \u2014 a fluent Java DSL for API testing with conditional execution, retries, and comprehensive assertions.",
  },
  {
    icon: ShieldCheck,
    title: "Rich Assertions",
    description:
      "Validate status codes, headers, JSON paths, XML/XPath, response times, and custom predicates with ease.",
  },
  {
    icon: BarChart3,
    title: "Real-time Observability",
    description:
      "Watch agent execution in real-time. Track tool calls, reasoning traces, and token usage as your tests are generated.",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative border-y border-border/50 py-24">
      <div className="container relative mx-auto px-4">
        <motion.div
          className="mb-16 text-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need for API Testing
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From Swagger specs to production-ready test suites in a single
            conversation.
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
