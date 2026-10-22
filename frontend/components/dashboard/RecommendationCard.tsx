"use client";

import { Button } from "@/components/ui/button";

interface RecommendationCardProps {
    onStart?: () => void;
}

export default function RecommendationCard({ onStart }: RecommendationCardProps) {
    return (
        <div className="flex h-full flex-col justify-between gap-6 rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Drill a topic</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Practice one skill for about five minutes.
                </p>
            </div>
            <Button onClick={onStart} className="w-fit">
                Start a drill
            </Button>
        </div>
    );
}
