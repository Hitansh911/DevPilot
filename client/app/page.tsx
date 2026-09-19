"use client";

/**
 * DevPilot — Landing Page
 *
 * Colors come entirely from the project's existing design tokens
 * (app/globals.css): bg-background, text-foreground, text-muted-foreground,
 * bg-card, border (defaults to --border via the base layer), plus a small
 * "brand" token set added for this page's purple AI accent — see the
 * "Landing page brand accent" block in globals.css. Toggling the `dark`
 * class (via next-themes) re-colors this whole page automatically.
 *
 * Fonts: h1–h6 already get --font-heading (Poppins) globally from
 * globals.css. `font-mono` / `font-sans` map to --font-mono / --font-geist-sans
 * via the @theme inline block, so plain Tailwind classes work directly.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  GitBranch,
  FileCode2,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGithubLoginUrl } from "@/lib/api";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/text-hover-effect";
import { Mail, Phone, MapPin } from "lucide-react";

// ---------------------------------------------------------------------------
// Small utility: reveals text character-by-character, like a streaming token.
// ---------------------------------------------------------------------------
function useTypewriter(fullText: string, active: boolean, speed = 14) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) return;
    setText("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [fullText, active, speed]);

  return text;
}

// ---------------------------------------------------------------------------
// Brand marks
// ---------------------------------------------------------------------------
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
function LinkedinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" style={{ fill: "var(--foreground)" }} />
      <path d="M10 11L14 16L10 21" style={{ stroke: "var(--brand)" }} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 21H22" style={{ stroke: "var(--background)" }} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Hero conversational preview
// ---------------------------------------------------------------------------
function HeroPreview() {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(t);
  }, []);

  const answer =
    "The rate limiter lives in middleware/throttle.ts. It uses a sliding window keyed on user ID, checked before auth resolves, so unauthenticated requests share one bucket.";
  const streamed = useTypewriter(answer, started, 12);
  const done = streamed.length === answer.length;

  return (
    <div className="relative rounded-2xl border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.15)]">
      {/* window chrome */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <GitBranch className="size-3.5" />
          acme/payments-api
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-2.5 py-0.5 text-[11px] font-medium text-brand font-mono">
          <span className="size-1.5 rounded-full bg-brand" />
          indexed
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* user turn */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-foreground px-4 py-2.5 text-sm text-background">
            Where's the rate limiter and what does it key on?
          </div>
        </div>

        {/* assistant turn */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint">
            <Sparkles className="size-3.5 text-brand" />
          </div>
          <div className="max-w-[88%] space-y-2.5">
            <div className="rounded-xl rounded-tl-sm border bg-background px-4 py-3 text-sm leading-relaxed text-foreground">
              {streamed}
              {!done && <span className="ml-0.5 inline-block h-4 w-[2px] -translate-y-0.5 animate-pulse bg-brand" />}
            </div>
            {done && (
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-card border px-2 py-1 text-[11px] font-mono text-muted-foreground">
                  <FileCode2 className="size-3 text-brand" />
                  middleware/throttle.ts:18
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-card border px-2 py-1 text-[11px] font-mono text-muted-foreground">
                  <FileCode2 className="size-3 text-brand" />
                  middleware/throttle.ts:31
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t px-4 py-3">
        <div className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground/70">
          Ask this repo anything…
        </div>
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
          aria-label="Send"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabbed "live demo" section
// ---------------------------------------------------------------------------
type DemoTab = "ask" | "explain" | "refactor";

const DEMO_CONTENT: Record<DemoTab, { prompt: string; body: string; file: string }> = {
  ask: {
    prompt: "Which endpoints write to the users table?",
    file: "src/routes/",
    body: "Three handlers write to users: POST /signup inserts a row, PATCH /users/:id updates profile fields, and the Stripe webhook handler updates billing_status after a successful charge.",
  },
  explain: {
    prompt: "Walk me through the checkout flow.",
    file: "src/services/checkout.ts",
    body: "createCheckout() validates the cart, reserves inventory with a row lock, then calls the payment provider. On success it emits order.created; on failure the reservation is released in a finally block.",
  },
  refactor: {
    prompt: "This function is doing too much. How would you split it?",
    file: "src/services/checkout.ts:44",
    body: "Pull inventory reservation into reserveStock(), keep createCheckout() as an orchestrator, and move the Stripe call behind a chargePayment() wrapper so retries can be unit tested in isolation.",
  },
};

function LiveDemo() {
  const [tab, setTab] = useState<DemoTab>("ask");
  const [copied, setCopied] = useState(false);
  const active = DEMO_CONTENT[tab];
  const streamed = useTypewriter(active.body, true, 10);

  const tabs: { id: DemoTab; label: string }[] = [
    { id: "ask", label: "Ask" },
    { id: "explain", label: "Explain" },
    { id: "refactor", label: "Refactor" },
  ];

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="flex items-center gap-1 border-b px-3 pt-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors",
              tab === t.id ? "text-foreground" : "text-muted-foreground/70 hover:text-muted-foreground"
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-3 -bottom-px h-[2px] bg-brand rounded-full" />}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x">
        <div className="p-6 space-y-3">
          <div className="text-xs font-mono text-muted-foreground/70">{active.file}</div>
          <div className="text-sm text-foreground font-medium">{active.prompt}</div>
          <p className="text-sm leading-relaxed text-muted-foreground min-h-[4.5rem]">{streamed}</p>
        </div>

        {/* Fixed dark code surface — intentionally independent of the
            light/dark toggle, like a terminal window always is. */}
        <div className="bg-zinc-950 p-6 font-mono text-[13px] leading-relaxed">
          <div className="flex items-center justify-between text-zinc-500 mb-3">
            <span>query.ts</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText("await devpilot.ask({ repo, query })");
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-zinc-300">
            <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> devpilot.
            <span className="text-sky-300">ask</span>({"{"}
            {"\n"}  repo: <span className="text-green-300">&quot;acme/payments-api&quot;</span>,
            {"\n"}  query: <span className="text-green-300">&quot;{active.prompt}&quot;</span>,
            {"\n"}{"}"});
            {"\n\n"}
            <span className="text-zinc-500">// res.citations -&gt; source file + line refs</span>
          </pre>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DevPilotLanding() {
  const integrations = ["GitHub", "GitLab", "Slack", "Linear", "Notion", "Vercel"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-heading font-semibold tracking-tight text-[15px]">DevPilot</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
            <a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <a
              href={getGithubLoginUrl ? getGithubLoginUrl() : "#"}
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-foreground text-background hover:opacity-90 text-sm font-medium px-4"
              )}
            >
              Try Now
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h1 className="text-[2.75rem] leading-[1.1] md:text-[3.4rem] font-semibold tracking-tight">
                Ask your codebase anything.
              </h1>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
                Connect a GitHub repository and DevPilot indexes it end to end —
                every answer comes back with the exact file and line it came from.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={getGithubLoginUrl ? getGithubLoginUrl() : "#"}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-brand hover:bg-brand-hover text-white font-medium px-6"
                  )}
                >
                  <GithubMark className="size-4 mr-2" />
                  Try Now
                </a>
                <a href="#demo" className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-brand transition-colors px-2 py-3">
                  See a live example
                  <ChevronRight className="size-4" />
                </a>
              </div>

              <p className="mt-6 text-sm text-muted-foreground/70">
                Free for public repositories · No credit card required
              </p>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* Integration strip */}
        <section id="integrations" className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
            <span className="text-sm text-muted-foreground/70 shrink-0 font-mono">
              Works alongside
            </span>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {integrations.map((name) => (
                <span key={name} className="text-[15px] font-medium text-muted-foreground">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities — bento grid, deliberately uneven */}
        <section id="capabilities" className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-lg">
            <h2 className="text-3xl font-semibold tracking-tight">Built to answer, not to guess</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Every response is grounded in the repository you connected — no fabricated
              function names, no invented endpoints.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-12 gap-4">
            {/* large card */}
            <div className="md:col-span-7 rounded-2xl border bg-card p-7">
              <MessagesSquare className="size-6 text-brand" />
              <h3 className="mt-4 text-lg font-semibold">Cited, line-level answers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-md">
                Answers link straight back to the file and line they were pulled from,
                so you can verify without leaving the conversation.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-brand-tint px-2 py-1 text-[11px] font-mono text-brand">
                  auth.ts:42
                </span>
                <span className="rounded-md bg-brand-tint px-2 py-1 text-[11px] font-mono text-brand">
                  routes/webhook.ts:19
                </span>
              </div>
            </div>

            {/* small card */}
            <div className="md:col-span-5 rounded-2xl border bg-card p-7">
              <Search className="size-6 text-brand" />
              <h3 className="mt-4 text-lg font-semibold">Full-repo indexing</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every commit re-chunks and re-embeds changed files automatically —
                nothing goes stale.
              </p>
            </div>

            {/* three even smaller cards */}
            <div className="md:col-span-4 rounded-2xl border bg-card p-6">
              <GitBranch className="size-5 text-brand" />
              <h3 className="mt-3 text-base font-semibold">Branch-aware</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">Ask against any branch, not just main.</p>
            </div>
            <div className="md:col-span-4 rounded-2xl border bg-card p-6">
              <ShieldCheck className="size-5 text-brand" />
              <h3 className="mt-3 text-base font-semibold">Private by default</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">Your code is never used to train models.</p>
            </div>
            <div className="md:col-span-4 rounded-2xl border bg-card p-6">
              <FileCode2 className="size-5 text-brand" />
              <h3 className="mt-3 text-base font-semibold">Multi-file context</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">Follows imports across files automatically.</p>
            </div>
          </div>
        </section>

        {/* Live demo */}
        <section id="demo" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="max-w-lg mb-10">
            <h2 className="text-3xl font-semibold tracking-tight">See it work on a real repo</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Same underlying answer, three ways to ask for it.
            </p>
          </div>
          <LiveDemo />
        </section>

        {/* Final CTA */}
        <section className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-xl mx-auto">
              Connect a repository and ask your first question
            </h2>
            <p className="mt-3 text-muted-foreground">Indexing usually finishes in under a minute.</p>
            <div className="mt-8">
              <a
                href={getGithubLoginUrl ? getGithubLoginUrl() : "#"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-brand hover:bg-brand-hover text-white font-medium px-7"
                )}
              >
                <GithubMark className="size-4 mr-2" />
                
                Try Now
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer — intentionally forced into the dark palette (via the
          `dark` class scoped to just this element) regardless of the
          site-wide theme toggle, same idea as the fixed-dark code panel
          above. The glow + hover-reveal wordmark only read well on dark. */}
      <footer className="dark relative overflow-hidden border-t bg-background text-foreground">
        <FooterBackgroundGradient />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-10">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <Logo className="size-7" />
                <span className="font-heading font-semibold text-foreground">DevPilot</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Connect a GitHub repository and ask it anything — every answer
                is grounded in the actual code, with citations.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a></li>
                <li><a href="#demo" className="hover:text-foreground transition-colors">Live demo</a></li>
                <li><a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">
                Contact Us
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 text-brand shrink-0" />
                  <a href="mailto:hitanshpawar2005@gmail.com" className="hover:text-foreground transition-colors">
                      hitanshpawar2005@gmail.com
                   </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <LinkedinMark className="size-4 text-brand shrink-0" />
                  <a href="https://www.linkedin.com/in/hitansh-pawar-09a9a9287/" className="hover:text-foreground transition-colors">HitanshPawar</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-brand shrink-0" />
                  <span>Pune, India</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground/70">
            <span>&copy; {new Date().getFullYear()} DevPilot. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </span>
          </div>
        </div>

        

        <div className="relative z-10 h-36 sm:h-44 md:h-56">
          <TextHoverEffect text="DEVPILOT" duration={0} />
        </div>
      </footer>
    </div>
  );
}