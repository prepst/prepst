"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Gift, MessageCircle } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-cyan-500/10 backdrop-blur-sm">
      {/* Decorative blur effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-primary shadow-lg shadow-emerald-500/20 sm:flex">
            <Gift className="h-6 w-6 text-white" />
          </div>

          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Full Access
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              Prep St is <span className="text-emerald-600 dark:text-emerald-400">free</span>.
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
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-violet-500/20 transition-all hover:scale-105">
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
