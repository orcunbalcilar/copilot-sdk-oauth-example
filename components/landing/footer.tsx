import { Heart, Sparkles } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <span className="font-semibold">RestFlowAI</span>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Built with
          <Heart className="size-3.5 animate-pulse fill-rose-500 text-rose-500" />
          using RestFlow, Next.js &amp; GitHub Copilot SDK
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="https://github.com/orcunbalcilar/restflow"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub<span className="sr-only"> (opens in new tab)</span>
          </Link>
          <Link href="/chat" className="hover:text-foreground">
            Get Started
          </Link>
        </div>
      </div>
    </footer>
  )
}
