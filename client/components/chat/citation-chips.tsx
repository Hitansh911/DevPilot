"use client";

import { FileCode2 } from "lucide-react";

import type { Citation, Repository } from "@/lib/api";

export function citationHref(repo: Repository, citation: Citation) {
  const line =
    citation.startLine != null
      ? `#L${citation.startLine}${
          citation.endLine && citation.endLine !== citation.startLine
            ? `-L${citation.endLine}`
            : ""
        }`
      : "";
  return `https://github.com/${repo.fullName}/blob/${repo.defaultBranch}/${citation.filePath}${line}`;
}

export function CitationChips({
  repo,
  citations,
}: {
  repo: Repository;
  citations: Citation[];
}) {
  if (!citations.length) return null;

  return (
    <div className="flex flex-wrap gap-1 pt-1">
      {citations.map((citation, index) => (
        <a
          key={`${citation.filePath}-${index}`}
          href={citationHref(repo, citation)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-[18px] max-w-full items-center gap-1 rounded-[5px] bg-black/5 pr-1.5 pl-[3px] font-mono text-[10.5px] text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground dark:bg-white/10 dark:hover:bg-white/15"
          style={{
            animation: "citation-pop-in 200ms cubic-bezier(0.23,1,0.32,1) both",
          }}
        >
          <span className="flex size-3 shrink-0 items-center justify-center rounded-[3px] bg-black/10 dark:bg-white/15">
            <FileCode2 className="size-2.5" />
          </span>
          <span className="truncate">
            {citation.filePath}
            {citation.startLine != null ? `:${citation.startLine}` : ""}
          </span>
        </a>
      ))}
      <style jsx>{`
        @keyframes citation-pop-in {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}