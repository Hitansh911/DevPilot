"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Mic, Plus, SendHorizontal, Settings2, Square, X } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "search", label: "Search this repo" },
  { id: "explain", label: "Explain a file" },
  { id: "trace", label: "Trace a flow" },
] as const;

export function ChatComposer({
  disabled,
  streaming,
  onSend,
  onStop,
}: {
  disabled?: boolean;
  streaming?: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStop?: () => void;
}) {
  const [value, setValue] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  async function submit() {
    const content = value.trim();
    if (!content || disabled || streaming) return;
    setValue("");
    await onSend(content);
  }

  const hasValue = value.trim().length > 0;
  const activeToolLabel = TOOLS.find((t) => t.id === activeTool)?.label;

  return (
    <div className="bg-white dark:bg-[#212121] px-4 pb-4 pt-2">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        <div className="flex flex-col rounded-[28px] border border-black/10 bg-white p-2 shadow-sm dark:border-transparent dark:bg-[#303030]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask about architecture, files, flows…"
            disabled={disabled}
            className="min-h-12 w-full resize-none border-0 bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-0 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
          />

          <div className="mt-0.5 flex items-center gap-2 p-1 pt-0">
            {/* Decorative only — no backend endpoint for attachments yet */}
            <button
              type="button"
              disabled
              title="Attach file (coming soon)"
              className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-foreground opacity-40 dark:text-white"
            >
              <Plus className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen((v) => !v)}
                className="flex h-8 items-center gap-1.5 rounded-full px-2 text-sm text-foreground transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-[#515151]"
              >
                <Settings2 className="h-4 w-4" />
                {!activeTool && "Tools"}
              </button>

              {toolsOpen && (
                <div className="absolute bottom-10 left-0 z-20 w-56 rounded-xl border bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-[#303030]">
                  {TOOLS.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        setActiveTool(tool.id);
                        setToolsOpen(false);
                      }}
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-[#515151]"
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeTool && (
              <button
                type="button"
                onClick={() => setActiveTool(null)}
                className="flex h-8 items-center gap-1.5 rounded-full px-2 text-sm text-[#2294ff] hover:bg-black/5 dark:text-[#99ceff] dark:hover:bg-[#3b4045]"
              >
                {activeToolLabel}
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Decorative only — no voice endpoint yet */}
              <button
                type="button"
                disabled
                title="Voice input (coming soon)"
                className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full text-foreground opacity-40 dark:text-white"
              >
                <Mic className="h-5 w-5" />
              </button>

              {streaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  aria-label="Stop generating"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={disabled || !hasValue}
                  onClick={() => void submit()}
                  aria-label="Send message"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:bg-black/40 dark:bg-white dark:text-black dark:disabled:bg-[#515151]"
                  )}
                >
                  {disabled ? <Spinner className="h-4 w-4" /> : <SendHorizontal className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="px-1 text-xs text-muted-foreground">
          Press <Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
        </p>
      </div>
    </div>
  );
}