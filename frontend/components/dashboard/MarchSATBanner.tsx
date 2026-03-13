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
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/18 via-purple-500/12 to-fuchsia-500/10 shadow-sm">
      {/* Decorative blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 right-8 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -bottom-16 left-12 h-28 w-28 rounded-full bg-purple-500/14 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="text-center sm:text-left">
            <div className="mb-1">
              <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                Free Access
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Prep St is <span className="text-violet-600 dark:text-violet-400">free</span>.
            </h3>
            <p className="text-sm text-muted-foreground">
              Every student gets full access right now. Join the Discord for updates,
              feedback, and help from the Prep St community.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://discord.gg/A6xqzcvjvZ"
            target="_blank"
            rel="noreferrer"
          >
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm transition-all">
              Join Discord
              <MessageCircle className="h-4 w-4 ml-2" />
            </Button>
          </a>

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
