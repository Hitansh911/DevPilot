"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function StreamingWords({
  text,
  streaming,
}: {
  text: string;
  streaming?: boolean;
}) {
  const tokens = text.length ? text.split(/(\s+)/) : [];

  // Tracks how many tokens were already on screen before this render, so
  // only the newly-arrived tokens animate — even if a big chunk of text
  // (or the whole message) lands in a single update, each new word still
  // cascades in one after another instead of all fading at once.
  const revealedRef = useRef(0);
  const baseline = revealedRef.current;

  useEffect(() => {
    revealedRef.current = tokens.length;
  }, [tokens.length]);

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground dark:text-white">
      {tokens.map((token, i) => {
        const isNew = i >= baseline;
        return (
          <motion.span
            key={i}
            initial={isNew ? { opacity: 0, filter: "blur(6px)" } : false}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.35,
              delay: isNew ? (i - baseline) * 0.025 : 0,
              ease: "easeOut",
            }}
          >
            {token}
          </motion.span>
        );
      })}
      {streaming && (
        <motion.span
          className="ml-0.5 inline-block h-4 w-1.5 rounded-sm bg-foreground/50 align-middle"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </p>
  );
}