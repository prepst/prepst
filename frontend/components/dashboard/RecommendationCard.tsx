"use client";

import { Button } from "@/components/ui/button";

interface RecommendationCardProps {
    onStart?: () => void;
}

export default function RecommendationCard({ onStart }: RecommendationCardProps) {
    return (
        <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-1.5 bg-practice" />
            <div className="flex flex-1 flex-col justify-between gap-6 p-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Drill a topic</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Practice one skill for about five minutes.
                </p>
            </div>
            <Button variant="outline" onClick={onStart} className="w-fit border-practice/40 text-practice hover:bg-practice-soft hover:text-practice">
                Start a drill
            </Button>
            </div>
        </div>
    );
}
