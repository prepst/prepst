"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_DISMISSED_KEY = "prepst-free-banner-dismissed";

export function MarchSATBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  };

  if (isDismissed) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="text-left">
          <h2 className="text-base font-semibold text-foreground">
            Prep St is free
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice, study plans, and mock exams are open. Discord is there for questions and updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a
              href="https://discord.gg/A6xqzcvjvZ"
              target="_blank"
              rel="noreferrer"
            >
              Join Discord
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/50"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
