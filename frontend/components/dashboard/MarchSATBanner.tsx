"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_DISMISSED_KEY = "march-sat-banner-dismissed";

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

    // Calculate days until March 14, 2026
    const targetDate = new Date("2026-03-14T00:00:00");
    const now = new Date();
    const daysRemaining = Math.ceil(
        (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-amber-500/10 border border-primary/20 backdrop-blur-sm">
            {/* Decorative blur effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-primary shadow-lg shadow-primary/20">
                        <Gift className="h-6 w-6 text-white" />
                    </div>

                    <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                March SAT Campaign
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                            PrepSt+ is <span className="text-emerald-600 dark:text-emerald-400">FREE</span> until March 14th!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {daysRemaining > 0
                                ? `${daysRemaining} days left to access all premium features at no cost`
                                : "Last day for free premium access!"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/subscription">
                        <Button className="bg-gradient-to-r from-emerald-600 to-primary hover:from-emerald-500 hover:to-primary/90 text-white font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                            Explore Features
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </Link>

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
