import { useEffect, useRef, useState, useCallback } from "react";
import type Highlighter from "web-highlighter";

const HIGHLIGHT_STORAGE_PREFIX = "prepst-highlights-";

interface SelectionInfo {
  word: string;
  contextSentence: string;
  position: { x: number; y: number };
  source: "selection" | "highlight";
}

interface UseTextHighlighterOptions {
  questionId: string;
  enabled?: boolean;
  onSaveToVocab?: (word: string, contextSentence: string) => void;
}

export function useTextHighlighter({
  questionId,
  enabled = true,
  onSaveToVocab,
}: UseTextHighlighterOptions) {
  const highlighterRef = useRef<Highlighter | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentQuestionIdRef = useRef<string | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Extract context sentence from text content
  const getContextSentenceFromText = useCallback((fullText: string, word: string): string => {
    // Find sentences by splitting on period, question mark, or exclamation mark
    const sentences = fullText.split(/(?<=[.!?])\s+/);
    
    // Find the sentence containing the word
    const contextSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(word.toLowerCase())
    );
    
    return contextSentence?.trim() || fullText.trim().slice(0, 200);
  }, []);

  // Handle hover on highlighted text
  const handleHighlightMouseEnter = useCallback((e: MouseEvent) => {
    if (!onSaveToVocab) return;
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains("text-highlight")) return;

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Small delay to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      const highlightedText = target.textContent?.trim() || "";
      
      // Only show for single words (no spaces)
      const wordCount = highlightedText.split(/\s+/).length;
      if (highlightedText.length < 2 || wordCount > 1) return;

      const rect = target.getBoundingClientRect();
      
      // Try to get context from parent element
      const parentText = target.parentElement?.textContent || highlightedText;
      const contextSentence = getContextSentenceFromText(parentText, highlightedText);

      setSelectionInfo({
        word: highlightedText.toLowerCase(),
        contextSentence,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        },
        source: "highlight",
      });
    }, 150);
  }, [onSaveToVocab, getContextSentenceFromText]);

  // Handle mouse leave from highlighted text
  const handleHighlightMouseLeave = useCallback((e: MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    // Don't clear if moving to the vocab button
    if (relatedTarget?.closest('[data-vocab-button]')) return;
    
    // Clear the hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Add a longer delay before hiding to allow moving to the button
    hoverTimeoutRef.current = setTimeout(() => {
      // Only clear if the current info came from a highlight hover
      setSelectionInfo(prev => {
        if (prev?.source === "highlight") return null;
        return prev;
      });
    }, 500);
  }, []);

  // Cancel hide timeout (called when mouse enters the vocab button)
  const cancelHideTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Handle save to vocab
  const handleSaveToVocab = useCallback(() => {
    if (!selectionInfo || !onSaveToVocab) return;
    
    onSaveToVocab(selectionInfo.word, selectionInfo.contextSentence);
    setSelectionInfo(null);
    
    // Clear selection if it was from text selection
    if (selectionInfo.source === "selection") {
      window.getSelection()?.removeAllRanges();
    }
  }, [selectionInfo, onSaveToVocab]);

  // Clear selection info when clicking elsewhere
  const handleClick = useCallback((e: MouseEvent) => {
    // Don't clear if clicking the vocab button
    const target = e.target as HTMLElement;
    if (target.closest('[data-vocab-button]')) return;
    
    // Don't clear if clicking on a highlight (let hover handle it)
    if (target.classList.contains("text-highlight")) return;
    
    setSelectionInfo(null);
  }, []);

  // Initialize highlighter
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    let instance: Highlighter | null = null;
    let isMounted = true;

    const initHighlighter = async () => {
      try {
        const { default: HighlighterClass } = await import("web-highlighter");
        if (!isMounted || !containerRef.current) return;

        const highlighter = new HighlighterClass({
          $root: containerRef.current,
          style: {
            className: "text-highlight",
          },
        });

        highlighter.run();

        // Save highlights to localStorage when created
        highlighter.on(HighlighterClass.event.CREATE, ({ sources }) => {
          if (!currentQuestionIdRef.current) return;
          const key = `${HIGHLIGHT_STORAGE_PREFIX}${currentQuestionIdRef.current}`;

          const existingStr = localStorage.getItem(key);
          const existing = existingStr ? JSON.parse(existingStr) : [];

          const updated = [...existing, ...sources];
          localStorage.setItem(key, JSON.stringify(updated));
        });

        // Remove from localStorage when deleted
        highlighter.on(HighlighterClass.event.REMOVE, ({ ids }) => {
          if (!currentQuestionIdRef.current) return;
          const key = `${HIGHLIGHT_STORAGE_PREFIX}${currentQuestionIdRef.current}`;

          const existingStr = localStorage.getItem(key);
          if (!existingStr) return;

          const existing = JSON.parse(existingStr);
          const filtered = existing.filter((h: any) => !ids.includes(h.id));
          localStorage.setItem(key, JSON.stringify(filtered));
        });

        // Click to remove highlights
        highlighter.on(HighlighterClass.event.CLICK, ({ id }) => {
          highlighter.remove(id);
        });

        instance = highlighter;
        highlighterRef.current = highlighter;
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize highlighter:", error);
      }
    };

    initHighlighter();

    return () => {
      isMounted = false;
      if (instance) {
        instance.dispose();
      }
      highlighterRef.current = null;
      currentQuestionIdRef.current = null; // Reset to force reload when re-initialized
      setIsReady(false);
    };
  }, [enabled]);

  // Listen for hover on highlights and clicks
  useEffect(() => {
    if (!enabled || !onSaveToVocab || !containerRef.current) return;

    const container = containerRef.current;
    
    // Use event delegation for highlight hover
    container.addEventListener("mouseover", handleHighlightMouseEnter);
    container.addEventListener("mouseout", handleHighlightMouseLeave);
    document.addEventListener("mousedown", handleClick);

    return () => {
      container.removeEventListener("mouseover", handleHighlightMouseEnter);
      container.removeEventListener("mouseout", handleHighlightMouseLeave);
      document.removeEventListener("mousedown", handleClick);
      
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [enabled, onSaveToVocab, handleHighlightMouseEnter, handleHighlightMouseLeave, handleClick]);

  // Load highlights when question changes
  useEffect(() => {
    if (!enabled || !isReady || currentQuestionIdRef.current === questionId) return;

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
  }, [questionId, enabled, isReady]);

  return { 
    containerRef, 
    selectionInfo,
    handleSaveToVocab,
    clearSelection: () => setSelectionInfo(null),
    cancelHideTimeout,
  };
}
