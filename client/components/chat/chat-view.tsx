"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { IndexingState } from "@/components/chat/indexing-state";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatMessages,
  useChatSessions,
  useCreateChatSession,
  useClearChatHistory,
  useStreamChat,
} from "@/hooks/use-chat";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";

const DRAFT_TITLE_MAX_LENGTH = 60;

function titleFromMessage(content: string) {
  const trimmed = content.trim();
  if (trimmed.length <= DRAFT_TITLE_MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, DRAFT_TITLE_MAX_LENGTH).trimEnd()}…`;
}

export function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);
  const isIndexing = repoQuery.data?.indexStatus === "INDEXING";
  const statusQuery = useIndexStatus(
    repoId,
    isIndexing || repoQuery.data?.indexStatus === "PENDING"
  );

  const indexStatus =
    statusQuery.data?.indexStatus ?? repoQuery.data?.indexStatus;
  const ready = indexStatus === "READY";

  const sessionsQuery = useChatSessions(repoId, ready);
  const createSession = useCreateChatSession(repoId);
  const clearHistory = useClearChatHistory(repoId);
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(undefined);
  // True while the user has clicked "New chat" but hasn't sent a first
  // message yet — no session exists in the backend for this draft.
  const [isDraft, setIsDraft] = useState(false);
  const autoCreateRef = useRef(false);

  const sessionId = isDraft
    ? null
    : selectedSessionId ?? sessionsQuery.data?.[0]?.id ?? null;

  const messagesQuery = useChatMessages(sessionId);
  const { send, stop, streaming, streamText } = useStreamChat(sessionId);

  useEffect(() => {
    if (!ready || sessionsQuery.isLoading) return;
    if (sessionsQuery.data && sessionsQuery.data.length > 0) return;
    if (
      !sessionsQuery.isSuccess ||
      (sessionsQuery.data?.length ?? 0) > 0 ||
      autoCreateRef.current
    ) {
      return;
    }

    autoCreateRef.current = true;
    createSession.mutate(undefined, {
      onSuccess: (session) => setSelectedSessionId(session.id),
      onError: () => {
        autoCreateRef.current = false;
      },
    });
  }, [
    ready,
    sessionsQuery.isLoading,
    sessionsQuery.isSuccess,
    sessionsQuery.data,
    createSession,
  ]);

  function handleNewChat() {
    setIsDraft(true);
  }

  function handleSelectSession(id: string) {
    setIsDraft(false);
    setSelectedSessionId(id);
  }

  /**
   * Called by ChatSidebar when the user clicks the trash icon on a session.
   * The actual DELETE request is fired inside the sidebar's hook; here we
   * handle the navigation fallback so the UI never points to a deleted session.
   */
  function handleDeleteSession(deletedId: string) {
    if (sessionId !== deletedId) return; // deleted a non-active session — nothing to do

    // The optimistic update already removed the session from the cache; find the
    // next one from the current snapshot (before invalidation).
    const remaining =
      sessionsQuery.data?.filter((s) => s.id !== deletedId) ?? [];

    if (remaining.length > 0) {
      setIsDraft(false);
      setSelectedSessionId(remaining[0].id);
    } else {
      // No sessions left — go back to blank draft state
      setSelectedSessionId(undefined);
      setIsDraft(true);
    }
  }

  function handleClearHistory() {
    if (!sessionId) return;
    clearHistory.mutate(sessionId);
  }

  async function handleSend(content: string) {
    if (isDraft) {
      createSession.mutate(titleFromMessage(content), {
        onSuccess: async (session) => {
          setIsDraft(false);
          setSelectedSessionId(session.id);
          await send(content, session.id);
        },
      });
      return;
    }
    await send(content);
  }

  if (repoQuery.isLoading) {
    return (
      <AppShell title="Loading chat…" className="h-dvh overflow-hidden">
        <div className="grid flex-1 gap-4 p-4 md:grid-cols-[16rem_1fr]">
          <Skeleton className="min-h-80 rounded-2xl" />
          <Skeleton className="min-h-80 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (repoQuery.isError || !repoQuery.data) {
    return (
      <AppShell title="Repository unavailable" className="h-dvh overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm text-muted-foreground">
            {(repoQuery.error as Error)?.message ?? "Repository not found"}
          </p>
          <Button render={<Link href="/dashboard" />}>Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  const repo = repoQuery.data;
  const hasMessages = (messagesQuery.data?.length ?? 0) > 0;

  return (
    <AppShell
      title={repo.fullName}
      description={
        ready
          ? "Ask questions grounded in this repository"
          : "Waiting for indexing to finish"
      }
      actions={
        <div className="flex items-center gap-2">
          {/* Clear History — visible only on an active non-draft session with messages */}
          {ready && sessionId && !isDraft && hasMessages && (
            <Button
              variant="outline"
              size="sm"
              disabled={clearHistory.isPending || streaming}
              onClick={handleClearHistory}
              aria-label="Clear chat history"
            >
              <Trash2 data-icon="inline-start" className="h-4 w-4" />
              Clear history
            </Button>
          )}
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            <ArrowLeft data-icon="inline-start" />
            Repos
          </Button>
        </div>
      }
      className="h-dvh overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#212121] md:flex-row">
        <ChatSidebar
          repo={{
            ...repo,
            indexStatus: indexStatus ?? repo.indexStatus,
            filesProcessed:
              statusQuery.data?.filesProcessed ?? repo.filesProcessed,
            filesTotal: statusQuery.data?.filesTotal ?? repo.filesTotal,
            chunkCount: statusQuery.data?.chunkCount ?? repo.chunkCount,
            errorMessage: statusQuery.data?.errorMessage ?? repo.errorMessage,
          }}
          sessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {!ready ? (
            <IndexingState repo={repo} status={statusQuery.data} />
          ) : (
            <>
              <ChatMessages
                repo={repo}
                messages={messagesQuery.data ?? []}
                streamText={streamText}
                streaming={streaming}
                isLoading={!isDraft && messagesQuery.isLoading}
                onRetry={send}
                onSuggestionClick={handleSend}
              />
              <ChatComposer
                disabled={false}
                streaming={streaming}
                onSend={handleSend}
                onStop={stop}
              />
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}