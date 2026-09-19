"use client";

import { formatDistanceToNow } from "date-fns";
import { Plus, RotateCcw, Trash2 } from "lucide-react";

import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSessions, useDeleteChatSession } from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}) {
  const ready = repo.indexStatus === "READY";
  const sessionsQuery = useChatSessions(repo.id, ready);
  const reindex = useStartIndexing();
  const deleteSession = useDeleteChatSession(repo.id);

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    onDeleteSession(id);
    deleteSession.mutate(id);
  }

  return (
    <aside className="flex min-h-0 w-full flex-col overflow-hidden border-b bg-[#f9f9f9] dark:border-white/10 dark:bg-[#181818] md:w-64 md:border-b-0 md:border-r">
      <div className="space-y-3 p-3">
        <div className="space-y-1 px-1">
          <p className="truncate text-sm font-medium text-foreground dark:text-white">
            {repo.fullName}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <IndexStatusBadge status={repo.indexStatus} />
            {repo.isPrivate && (
              <span className="text-xs text-muted-foreground">Private</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!ready}
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 dark:bg-white dark:text-black"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
          <button
            type="button"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            aria-label="Re-index repository"
            className="flex h-9 w-9 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-black/5 disabled:opacity-40 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
        Sessions
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 px-2 pb-4">
          {!ready && (
            <p className="px-2 text-xs text-muted-foreground">
              Sessions unlock after indexing completes.
            </p>
          )}

          {sessionsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}

          {sessionsQuery.data?.map((session) => (
            <div key={session.id} className="group relative">
              <button
                type="button"
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 pr-9 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10",
                  sessionId === session.id && "bg-black/5 dark:bg-white/10"
                )}
              >
                <p className="truncate text-sm font-medium text-foreground dark:text-white">
                  {session.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </button>

              {/* Delete button — revealed on group hover */}
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={deleteSession.isPending}
                  className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-40 group-hover:flex dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  aria-label={`Delete session "${session.title}"`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Chat Session?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chat session? This action cannot be undone and will permanently delete the chat history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
                      onClick={(e) => handleDelete(e, session.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}

          {ready && sessionsQuery.isSuccess && sessionsQuery.data.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">
              No chats yet. Start one to begin.
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}