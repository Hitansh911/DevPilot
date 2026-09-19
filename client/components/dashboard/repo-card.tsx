"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  GitBranch,
  Lock,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
import { LanguageBadge } from "@/components/dashboard/language-badge";
import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { LanguageIcon } from "@/components/icons/language-icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { getRepoProgress, useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";
import ParticleDrift from "@/components/effects/particle-drift";

export function RepoCard({ repo }: { repo: Repository }) {
  const router = useRouter();
  const indexMutation = useStartIndexing();
  const isIndexing = repo.indexStatus === "INDEXING" || indexMutation.isPending;
  const isFailed = repo.indexStatus === "FAILED";
  const progress = getRepoProgress(repo);

  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-60, 60], [3, -3]);
  const rotateY = useTransform(mouseX, [-60, 60], [-3, 3]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });
  const glowX = useTransform(mouseX, (v) => v + 150);
  const glowY = useTransform(mouseY, (v) => v + 60);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  function openChat() {
    router.push(`/chat/${repo.id}`);
  }

  function handlePrimary() {
    if (repo.indexStatus === "READY") {
      openChat();
      return;
    }
    indexMutation.mutate(repo.id, {
      onSuccess: () => router.push(`/chat/${repo.id}`),
    });
  }

  return (
    <div style={{ perspective: 1200 }}>
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ y: -6, scale: 1.06, zIndex: 20 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-dashed bg-card/80 shadow-md shadow-foreground/5",
          isFailed
            ? "border-destructive/30 bg-destructive/2 hover:border-destructive/40"
            : "border-border/80 hover:border-foreground/15 hover:shadow-lg hover:shadow-foreground/10"
        )}
      >
        {/* Mouse-follow glow */}
        {!isFailed && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: useTransform(
                [glowX, glowY],
                ([x, y]) =>
                  `radial-gradient(180px circle at ${x}px ${y}px, hsl(var(--foreground) / 0.06), transparent 70%)`
              ),
            }}
          />
        )}

        {/* Particle drift background — revealed on hover */}
        <AnimatePresence>
          {isHovered && !isFailed && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ParticleDrift
                background="transparent"
                baseColor="#94a3b8"
                accentColor="#ffffff"
                density={90}
                dotSize={2.5}
                speed={22}
                hover={120}
                linkDistance={70}
                linkThickness={1}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  minWidth: 0,
                  minHeight: 0,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 border-b border-dashed border-border/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <motion.div
                animate={{ rotate: isHovered ? -6 : 0, scale: isHovered ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <LanguageBadge language={repo.language} showLabel={false} />
              </motion.div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{repo.owner}</p>
                <h3 className="truncate font-medium">{repo.name}</h3>
                <motion.div
                  className="mt-1 h-px bg-gradient-to-r from-foreground/40 via-foreground/15 to-transparent"
                  initial={{ scaleX: 0.2 }}
                  animate={{ scaleX: isHovered ? 1 : 0.2 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>
            <motion.div
              animate={{ scale: isIndexing ? [1, 1.06, 1] : 1 }}
              transition={{ duration: 1.4, repeat: isIndexing ? Infinity : 0, ease: "easeInOut" }}
            >
              <IndexStatusBadge status={repo.indexStatus} />
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col gap-3 p-4">
          {!isFailed && (
            <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
              {repo.description || "No description provided."}
            </p>
          )}

          {isFailed && repo.description && (
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {repo.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {repo.isPrivate && (
              <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Private
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
              <GitBranch className="size-3" />
              {repo.defaultBranch}
            </span>
            {repo.language && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2 py-0.5 text-xs">
                <LanguageIcon language={repo.language} size="sm" />
                {repo.language}
              </span>
            )}
            {repo.chunkCount > 0 && (
              <span
                className={cn(
                  "rounded-full border border-dashed px-2 py-0.5 text-xs",
                  isFailed
                    ? "border-destructive/20 text-destructive/80"
                    : "text-muted-foreground"
                )}
              >
                {repo.chunkCount.toLocaleString()} chunks
                {isFailed ? " indexed" : ""}
              </span>
            )}
          </div>

          <AnimatePresence>
            {isIndexing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2 overflow-hidden rounded-xl border border-dashed bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <motion.span
                      className="size-1.5 rounded-full bg-foreground/60"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    Indexing…
                  </span>
                  <span>
                    {repo.filesProcessed}/{repo.filesTotal || "?"}
                  </span>
                </div>
                <Progress value={progress || 8} />
              </motion.div>
            )}
          </AnimatePresence>

          {isFailed && repo.errorMessage && (
            <IndexErrorAlert message={repo.errorMessage} />
          )}
        </div>

        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 border-t border-dashed border-border/70 p-4">
          {repo.htmlUrl ? (
            <Button
              variant="ghost"
              size="sm"
              render={<a href={repo.htmlUrl} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink data-icon="inline-start" />
              GitHub
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            {repo.indexStatus === "READY" && (
              <Button variant="secondary" size="sm" onClick={openChat}>
                <MessageSquare data-icon="inline-start" />
                Chat
              </Button>
            )}
            <Button
              size="sm"
              variant={isFailed ? "outline" : "default"}
              className={cn(isFailed && "border-destructive/30 text-destructive hover:bg-destructive/10")}
              disabled={isIndexing}
              onClick={handlePrimary}
            >
              {isIndexing ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Indexing
                </>
              ) : repo.indexStatus === "READY" ? (
                <>
                  Open
                  <ArrowRight data-icon="inline-end" />
                </>
              ) : isFailed ? (
                <>
                  <RotateCcw data-icon="inline-start" />
                  Retry
                </>
              ) : (
                <>
                  <Sparkles data-icon="inline-start" />
                  Index
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.article>
    </div>
  );
}