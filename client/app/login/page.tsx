"use client";
import React from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AlertCircle } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import CursorRingField from "@/components/effects/cursor-ring-field";
import { BrandMark } from "@/components/layout/app-shell";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { getGithubLoginUrl } from '@/lib/api';
import { useCurrentUser } from '@/hooks/use-auth';

function LoginLoading(){
    return (
        <div className="flex min-h-svh items-center justify-center">
                <Spinner className="size-8"/>
        </div>
    )
}

const LoginContent = () => {
     const params = useSearchParams();
  const router = useRouter();
  const error = params.get("error");
  const next = params.get("next") || "/dashboard";
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(next.startsWith("/") ? next : "/dashboard");
    }
  }, [user, isLoading, next, router]);

  // Background theme-awareness — small addition, no new global tokens.
  // The canvas can't read CSS variables directly, so we just hand it two
  // hardcoded palettes and pick one based on the resolved theme.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = !mounted || resolvedTheme === "dark"; // default to dark pre-mount, avoids a flash
  const fieldBg = isDark
    ? { background: "#050508", colors: { color1: "#7189ff", color2: "#3074f9", color3: "#0b0b18" } }
    : { background: "#f5f4f8", colors: { color1: "#6d4aff", color2: "#4f32d1", color3: "#d8d3ec" } };


  return (
   <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Background only — header, card, and all auth logic below are
          untouched. This canvas paints its own background color, so it
          fully replaces the old radial-gradient div. It's a fixed dark
          scene (not theme-reactive) by design, same as the footer/code
          panel elsewhere — this is intentional and independent of light/dark. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <CursorRingField background={fieldBg.background} colors={fieldBg.colors} />
      </div>

      <header className="relative z-10 flex h-14 items-center justify-between px-4">
        <Link href="/">
          <BrandMark />
        </Link>
        <ModeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        {/* VISUAL CHANGE ONLY: vibrant gradient card instead of the flat
            bg-card/90 surface. Gradient blends the landing page's purple
            "brand" accent into the app's pink "primary" accent, so it
            still feels like this product rather than a random rainbow.
            A 1px inset border + soft glow give it a bit of depth. */}
        <Card
          className={cn(
            "w-full max-w-sm overflow-hidden border-0 shadow-2xl",
            "bg-[linear-gradient(155deg,var(--brand)_0%,var(--primary)_55%,var(--card)_100%)]",
            "relative before:absolute before:inset-0 before:bg-card/85 before:content-['']",
          )}
        >
          {/* everything below sits above the before:bg-card/85 overlay,
              so text stays readable while the card edges/corners still
              show the vibrant gradient bleeding through */}
          <CardHeader className="relative z-10 space-y-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-primary text-white shadow-md shadow-brand/30">
              <GitHubIcon className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <CardDescription>
                Connect GitHub to chat with your repositories.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Sign-in failed</AlertTitle>
                <AlertDescription>Please try again.</AlertDescription>
              </Alert>
            )}

            <a
              href={getGithubLoginUrl()}
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-brand to-primary text-white hover:opacity-90"
              )}
            >
              <GitHubIcon className="size-5" />
              Continue with GitHub
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}