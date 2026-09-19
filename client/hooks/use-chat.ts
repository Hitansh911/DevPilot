"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import { api, type ChatMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { streamChatMessage } from "@/lib/stream-chat";
import { toast } from "@/components/ui/toast";

export function useChatSessions(repositoryId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chat.sessions(repositoryId),
    queryFn: () => api.listSessions(repositoryId),
    enabled: Boolean(repositoryId) && enabled,
  });
}

export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.chat.messages(sessionId ?? ""),
    queryFn: () => api.getMessages(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useCreateChatSession(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => api.createSession(repositoryId, title),
    onSuccess: (session) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.sessions(repositoryId),
      });
      queryClient.setQueryData(queryKeys.chat.messages(session.id), []);
    },
    onError: (error: Error) => {
      toast.add({
        title: "Could not create chat",
        description: error.message,
        type: "error",
      });
    },
  });
}

/**
 * @param sessionId The "current" session this hook instance is bound to.
 * Can be null (e.g. while a new-chat draft has no session yet) — in that
 * case callers must pass an explicit `targetSessionId` to `send`.
 */
export function useStreamChat(sessionId: string | null) {
  const queryClient = useQueryClient();
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (content: string, targetSessionId?: string) => {
      const activeSessionId = targetSessionId ?? sessionId;
      if (!activeSessionId || !content.trim() || streaming) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const optimisticId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        role: "USER",
        content: content.trim(),
        citations: [],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.messages(activeSessionId),
        (prev) => [...(prev ?? []), optimistic]
      );

      setStreaming(true);
      setStreamText("");

      try {
        await streamChatMessage(activeSessionId, content.trim(), {
          signal: controller.signal,
          onUserMessage: (message) => {
            queryClient.setQueryData<ChatMessage[]>(
              queryKeys.chat.messages(activeSessionId),
              (prev) => [
                ...(prev ?? []).filter((m) => m.id !== optimisticId),
                message,
              ]
            );
          },
          onToken: (token) => {
            setStreamText((prev) => prev + token);
          },
          onAssistantMessage: (message) => {
            queryClient.setQueryData<ChatMessage[]>(
              queryKeys.chat.messages(activeSessionId),
              (prev) => [...(prev ?? []), message]
            );
            setStreamText("");
          },
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        toast.add({
          title: "Message failed",
          description: err instanceof Error ? err.message : "Unknown error",
          type: "error",
        });
        queryClient.setQueryData<ChatMessage[]>(
          queryKeys.chat.messages(activeSessionId),
          (prev) => (prev ?? []).filter((m) => m.id !== optimisticId)
        );
        setStreamText("");
      } finally {
        setStreaming(false);
      }
    },
    [sessionId, streaming, queryClient]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return { send, stop, streaming, streamText };
}

export function useDeleteChatSession(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.deleteSession(sessionId),

    // Optimistically remove the session from the list before the request completes
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.chat.sessions(repositoryId),
      });
      const prev = queryClient.getQueryData<import("@/lib/api").ChatSession[]>(
        queryKeys.chat.sessions(repositoryId)
      );
      queryClient.setQueryData<import("@/lib/api").ChatSession[]>(
        queryKeys.chat.sessions(repositoryId),
        (old) => old?.filter((s) => s.id !== sessionId) ?? []
      );
      return { prev };
    },

    onError: (_err, _sessionId, ctx) => {
      // Roll back the optimistic removal if the request failed
      queryClient.setQueryData(
        queryKeys.chat.sessions(repositoryId),
        ctx?.prev
      );
      toast.add({
        title: "Could not delete session",
        description: "Please try again.",
        type: "error",
      });
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.sessions(repositoryId),
      });
    },
  });
}

export function useClearChatHistory(repositoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => api.clearMessages(sessionId),

    // Optimistically empty the messages list before the request completes
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.chat.messages(sessionId),
      });
      const prev = queryClient.getQueryData<ChatMessage[]>(
        queryKeys.chat.messages(sessionId)
      );
      queryClient.setQueryData<ChatMessage[]>(
        queryKeys.chat.messages(sessionId),
        []
      );
      return { prev };
    },

    onError: (_err, sessionId, ctx) => {
      // Roll back the optimistic clear if the request failed
      queryClient.setQueryData(queryKeys.chat.messages(sessionId), ctx?.prev);
      toast.add({
        title: "Could not clear history",
        description: "Please try again.",
        type: "error",
      });
    },

    onSettled: (_data, _err, sessionId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.chat.messages(sessionId),
      });
    },
  });
}