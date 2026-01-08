"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Database } from "lucide-react";

function QuestionPoolContent() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="flex justify-center">
                <div className="w-full max-w-6xl px-6 py-12 space-y-12">
                    {/* Header */}
                    <div className="flex flex-col gap-4">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                                <Database className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                    Question Pool
                                </span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                                Question Pool
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                Browse and manage the complete database of practice questions.
                            </p>
                        </div>
                    </div>

                    {/* Content Placeholder */}
                    <div className="bg-card rounded-3xl p-8 border border-border shadow-sm min-h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Question database coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QuestionPoolPage() {
    return (
        <ProtectedRoute>
            <QuestionPoolContent />
        </ProtectedRoute>
    );
}
