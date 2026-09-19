"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";

const PHRASES = [
  "Thinking",
  "Reading files",
  "Analyzing code",
  "Searching the repo",
  "Piecing it together",
  "Almost there",
];

export function ThinkingBlock() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 py-1.5">
      <Spinner className="h-4 w-4" />
      <p
        key={phraseIndex}
        className="animate-in fade-in duration-300 bg-[linear-gradient(110deg,#9ca3af,35%,#111827,50%,#9ca3af,75%,#9ca3af)] bg-[length:200%_100%] bg-clip-text text-sm text-transparent dark:bg-[linear-gradient(110deg,#525252,35%,#fff,50%,#525252,75%,#525252)]"
        style={{ animation: "thinking-shimmer 2.5s linear infinite" }}
      >
        {PHRASES[phraseIndex]}
        <span className="inline-block w-4 animate-pulse">...</span>
      </p>
      <style jsx>{`
        @keyframes thinking-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}