import { useEffect, useRef } from "react";
import Highlighter from "web-highlighter";

const HIGHLIGHT_STORAGE_PREFIX = "prepst-highlights-";

interface UseTextHighlighterOptions {
  questionId: string;
  enabled?: boolean;
}

export function useTextHighlighter({
  questionId,
  enabled = true,
}: UseTextHighlighterOptions) {
  const highlighterRef = useRef<Highlighter | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentQuestionIdRef = useRef<string | null>(null);

  // Initialize highlighter
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const highlighter = new Highlighter({
      $root: containerRef.current,
      style: {
        className: "text-highlight",
      },
    });

    highlighter.run();

    // Save highlights to localStorage when created
    highlighter.on(Highlighter.event.CREATE, ({ sources }) => {
      if (!currentQuestionIdRef.current) return;
      const key = `${HIGHLIGHT_STORAGE_PREFIX}${currentQuestionIdRef.current}`;

      const existingStr = localStorage.getItem(key);
      const existing = existingStr ? JSON.parse(existingStr) : [];

      const updated = [...existing, ...sources];
      localStorage.setItem(key, JSON.stringify(updated));
    });

    // Remove from localStorage when deleted
    highlighter.on(Highlighter.event.REMOVE, ({ ids }) => {
      if (!currentQuestionIdRef.current) return;
      const key = `${HIGHLIGHT_STORAGE_PREFIX}${currentQuestionIdRef.current}`;

      const existingStr = localStorage.getItem(key);
      if (!existingStr) return;

      const existing = JSON.parse(existingStr);
      const filtered = existing.filter((h: any) => !ids.includes(h.id));
      localStorage.setItem(key, JSON.stringify(filtered));
    });

    // Click to remove highlights
    highlighter.on(Highlighter.event.CLICK, ({ id }) => {
      highlighter.remove(id);
    });

    highlighterRef.current = highlighter;

    return () => {
      highlighter.dispose();
      highlighterRef.current = null;
    };
  }, [enabled]);

  // Load highlights when question changes
  useEffect(() => {
    if (!enabled || currentQuestionIdRef.current === questionId) return;

    currentQuestionIdRef.current = questionId;

    if (!highlighterRef.current) return;

    const highlighter = highlighterRef.current;
    const key = `${HIGHLIGHT_STORAGE_PREFIX}${questionId}`;

    highlighter.removeAll();

    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const sources = JSON.parse(stored);
        sources.forEach((source: any) => {
          highlighter.fromStore(
            source.startMeta,
            source.endMeta,
            source.text,
            source.id
          );
        });
      } catch (e) {
        console.error("Failed to load highlights:", e);
      }
    }
  }, [questionId, enabled]);

  return { containerRef };
}
