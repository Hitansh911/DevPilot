"use client";

import { Bot, Check, Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { CitationChips } from "@/components/chat/citation-chips";
import { StreamingWords } from "@/components/chat/streaming-words";
import { ThinkingBlock } from "@/components/chat/thinking-block";
import { BrandMark } from "@/components/layout/app-shell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";

function MessageActions({
  content,
  onRetry,
}: {
  content: string;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable in this context — ignore
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-0.5">
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy message"
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Retry this response"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="ml-1 flex items-center gap-0.5 border-l border-black/10 pl-1.5 dark:border-white/10">
        <button
          type="button"
          aria-label="Good response"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-green-600 dark:hover:text-green-400"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Bad response"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-red-600 dark:hover:text-red-400"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ChatMessages({
  repo,
  messages,
  streamText,
  streaming,
  isLoading,
  onRetry,
  onSuggestionClick,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  streaming?: boolean;
  isLoading?: boolean;
  onRetry?: (content: string) => void | Promise<void>;
  onSuggestionClick?: (suggestion: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-16 w-2/3 rounded-3xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-3xl" />
        <Skeleton className="h-24 w-3/4 rounded-3xl" />
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1 bg-white dark:bg-[#212121]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        {messages.length === 0 && !streamText && (
          <div className="mt-16 text-center flex flex-col items-center">
            <BrandMark className="mb-6 scale-125 text-foreground dark:text-white" />
            <p className="text-xl font-medium text-foreground dark:text-white">
              Ask anything about this codebase
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
              <button 
                onClick={() => onSuggestionClick?.("Where is authentication handled?")}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-foreground transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-[#303030] dark:text-white dark:hover:bg-white/10"
              >
                Where is authentication handled?
              </button>
              <button 
                onClick={() => onSuggestionClick?.("Explain the repository indexing flow.")}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-foreground transition-colors hover:bg-black/5 dark:border-white/10 dark:bg-[#303030] dark:text-white dark:hover:bg-white/10"
              >
                Explain the repository indexing flow.
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "USER";
          return (
            <div key={message.id} className={isUser ? "flex justify-end" : "flex gap-3"}>
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={isUser ? "max-w-[75%]" : "min-w-0 flex-1"}>
                {isUser ? (
                  <div className="whitespace-pre-wrap rounded-3xl bg-[#f4f4f4] px-4 py-2.5 text-sm text-foreground dark:bg-[#2f2f2f] dark:text-white">
                    {message.content}
                  </div>
                ) : (
                  <>
                    <ChatMarkdown content={message.content} />
                    {message.citations?.length > 0 && (
                      <div className="mt-2">
                        <CitationChips repo={repo} citations={message.citations} />
                      </div>
                    )}
                    <MessageActions
                      content={message.content}
                      onRetry={
                        onRetry && messages[index - 1]?.role === "USER"
                          ? () => onRetry(messages[index - 1].content)
                          : undefined
                      }
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}

        {streaming && !streamText && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
              <Bot className="h-4 w-4" />
            </div>
            <ThinkingBlock />
          </div>
        )}

        {streamText && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <StreamingWords text={streamText} streaming />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}