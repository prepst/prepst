"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VocabularyWord, VocabSource } from "@/lib/types";

interface VocabCardModalProps {
  word: VocabularyWord;
  isOpen: boolean;
  onClose: () => void;
  getSourceBadge: (source: VocabSource) => React.ReactNode;
}

export function VocabCardModal({
  word,
  isOpen,
  onClose,
  getSourceBadge,
}: VocabCardModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Reset flip state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsFlipped(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-none">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flip Card Container */}
          <div
            className="relative w-full h-[400px] cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-700 transform-style-3d",
                isFlipped && "rotate-y-180"
              )}
            >
              {/* Front Side - Word */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <div
                  className={cn(
                    "w-full h-full rounded-2xl border-2 p-8 flex flex-col items-center justify-center",
                    word.is_mastered
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                      : "bg-card border-border"
                  )}
                >
                  <div className="absolute top-4 left-4">
                    {getSourceBadge(word.source)}
                  </div>

                  <h2 className="text-5xl font-bold text-foreground capitalize mb-4 text-center">
                    {word.word}
                  </h2>

                  <p className="text-muted-foreground text-sm">Click to see definition</p>
                </div>
              </div>

              {/* Back Side - Definition & Example */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                <div
                  className={cn(
                    "w-full h-full rounded-2xl border-2 p-8 flex flex-col",
                    word.is_mastered
                      ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                      : "bg-card border-border"
                  )}
                >
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-foreground capitalize mb-6 text-center">
                      {word.word}
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Definition
                        </p>
                        <p className="text-lg text-foreground/90 leading-relaxed">
                          {word.definition}
                        </p>
                      </div>

                      {word.example_usage && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Example
                          </p>
                          <p className="text-base text-muted-foreground italic leading-relaxed">
                            &ldquo;{word.example_usage}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm text-center mt-4">
                    Click to flip back
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
