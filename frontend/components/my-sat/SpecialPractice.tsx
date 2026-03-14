"use client";

import { useState, useEffect } from "react";
import {
    Sparkles, Send, ArrowRight, Loader2, Zap, Target, Brain, BookOpen,
    Clock, ChevronRight, CheckCircle, Play, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { buildPracticeSessionPath } from "@/lib/practice-navigation";
import { useRecentDrills } from "@/hooks/queries";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ExamplePrompt {
    icon: React.ElementType;
    title: string;
    description: string;
    prompt: string;
}

export interface DrillSession {
    id: string;
    created_at: string;
    completed_at: string | null;
    started_at: string | null;
    status: string;
    session_type: string;
    total_questions: number;
    correct_count: number;
    answered_count: number;
    topic_names: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const examplePrompts: ExamplePrompt[] = [
    {
        icon: Zap,
        title: "Quick Math Drill",
        description: "5 questions on Quadratics",
        prompt: "Create a session with 5 Math questions focusing on Quadratic Functions and Linear Equations",
    },
    {
        icon: BookOpen,
        title: "Reading Warmup",
        description: "10 R&W questions",
        prompt: "Create a warmup session with 10 Reading & Writing questions covering Text Structure and Main Ideas",
    },
    {
        icon: Target,
        title: "Mixed Challenge",
        description: "Geometry and Algebra mix",
        prompt: "Create a mixed session with 8 questions from Geometry, Circles, and Algebraic Expressions",
    },
    {
        icon: Brain,
        title: "Focus on Weaknesses",
        description: "Target weak topics",
        prompt: "Create a personalized session focusing on my weakest topics. Include 10 questions of varying difficulty",
    },
];

const loadingMessages = [
    "Analyzing your request...",
    "Selecting the best topics for you...",
    "Finding tailored questions...",
    "Building your practice session...",
    "Almost ready...",
];

// ─── Peppa Avatar ───────────────────────────────────────────────────────────

const PeppaAvatar = ({ size = "lg", animate = false }: { size?: "sm" | "lg"; animate?: boolean }) => {
    const sizeClasses = size === "lg" ? "w-14 h-14" : "w-10 h-10";
    const svgSize = size === "lg" ? "w-10 h-10" : "w-7 h-7";

    return (
        <div
            className={cn(
                sizeClasses,
                "rounded-2xl flex items-center justify-center shrink-0",
                "bg-[#fce4ec] dark:bg-[#3d2a2f]",
                "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.5)]",
                "dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
                animate && "animate-pulse"
            )}
        >
            <svg viewBox="0 0 100 100" className={svgSize}>
                <ellipse cx="50" cy="55" rx="32" ry="28" fill="#f8bbd9" />
                <ellipse cx="50" cy="62" rx="16" ry="10" fill="#f48fb1" />
                <circle cx="44" cy="62" r="2.5" fill="#ad1457" />
                <circle cx="56" cy="62" r="2.5" fill="#ad1457" />
                <circle cx="38" cy="46" r="5" fill="white" />
                <circle cx="62" cy="46" r="5" fill="white" />
                <circle cx="39" cy="46" r="2.5" fill="#333" />
                <circle cx="63" cy="46" r="2.5" fill="#333" />
                <circle cx="40" cy="44" r="1" fill="white" />
                <circle cx="64" cy="44" r="1" fill="white" />
                <ellipse cx="26" cy="32" rx="7" ry="10" fill="#f8bbd9" />
                <ellipse cx="74" cy="32" rx="7" ry="10" fill="#f8bbd9" />
            </svg>
        </div>
    );
};

// ─── Session History Item ───────────────────────────────────────────────────

export function SessionHistoryItem({ session, onNavigate }: { session: DrillSession; onNavigate: (id: string) => void }) {
    const isCompleted = session.status === "completed";
    const isInProgress = session.status === "in_progress" || (session.answered_count > 0 && !isCompleted);
    const isPending = !isCompleted && !isInProgress;

    const accuracy = isCompleted && session.total_questions > 0
        ? Math.round((session.correct_count / session.total_questions) * 100)
        : null;

    const progress = session.total_questions > 0
        ? Math.round((session.answered_count / session.total_questions) * 100)
        : 0;

    const timeAgo = session.created_at
        ? formatDistanceToNow(new Date(session.created_at), { addSuffix: true })
        : "Recently";

    return (
        <button
            onClick={() => onNavigate(session.id)}
            className={cn(
                "w-full text-left p-4 rounded-xl transition-all duration-200",
                "border group",
                isInProgress
                    ? "bg-primary/[0.03] border-primary/20 hover:border-primary/40"
                    : "bg-background border-border hover:border-border/80",
                "hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)]",
                "active:scale-[0.99]"
            )}
        >
            <div className="flex items-center gap-3">
                {/* Status icon */}
                <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    isCompleted && "bg-green-100 dark:bg-green-900/30",
                    isInProgress && "bg-primary/10",
                    isPending && "bg-muted"
                )}>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    {isInProgress && <Play className="w-4 h-4 text-primary fill-primary" />}
                    {isPending && <Clock className="w-4 h-4 text-muted-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Topic tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {session.topic_names.length > 0 ? (
                            session.topic_names.map((name, i) => (
                                <span key={i} className="text-xs font-medium text-foreground truncate max-w-[140px]">
                                    {i > 0 && <span className="text-muted-foreground mx-0.5">·</span>}
                                    {name}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs font-medium text-foreground">Drill Session</span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{session.total_questions} Q</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                        <span>{timeAgo}</span>
                    </div>

                    {/* Progress bar for in-progress */}
                    {isInProgress && progress > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                                {session.answered_count}/{session.total_questions}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right side: score or action */}
                <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && accuracy !== null && (
                        <div className={cn(
                            "text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg",
                            accuracy >= 80
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : accuracy >= 60
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        )}>
                            {accuracy}%
                        </div>
                    )}
                    {isInProgress && (
                        <Badge variant="outline" className="text-[10px] font-semibold border-primary/30 text-primary gap-1 px-2 py-0.5">
                            <RotateCcw className="w-3 h-3" />
                            Resume
                        </Badge>
                    )}
                    {isPending && (
                        <Badge variant="outline" className="text-[10px] font-semibold gap-1 px-2 py-0.5">
                            <Play className="w-3 h-3" />
                            Start
                        </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                </div>
            </div>
        </button>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SpecialPractice() {
    const router = useRouter();
    const [userPrompt, setUserPrompt] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    // Fetch recent drill sessions for history
    const { data: recentDrills = [] } = useRecentDrills(8);

    // Rotate loading messages
    useEffect(() => {
        if (!isCreating) {
            setLoadingMessageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [isCreating]);

    const handlePromptClick = (prompt: string) => {
        setUserPrompt(prompt);
        setShowChat(true);
    };

    const handleSubmit = async () => {
        if (!userPrompt.trim()) {
            toast.error("Please describe what you'd like to practice");
            return;
        }

        setIsCreating(true);

        try {
            const result = await api.createAISession(userPrompt.trim());

            toast.success(
                `Session created with ${result.num_questions} questions on ${result.topic_names.join(", ")}`
            );

            router.push(
                buildPracticeSessionPath(result.session_id, "/dashboard")
            );
        } catch (error) {
            console.error("Failed to create AI session:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to create practice session";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleNavigateSession = (sessionId: string) => {
        router.push(buildPracticeSessionPath(sessionId, "/dashboard"));
    };

    // Split sessions for display
    const inProgressSessions = recentDrills.filter(
        (s: DrillSession) => s.status === "in_progress" || (s.answered_count > 0 && s.status !== "completed")
    );
    const pendingSessions = recentDrills.filter(
        (s: DrillSession) => s.status === "pending" && s.answered_count === 0
    );
    const completedSessions = recentDrills.filter(
        (s: DrillSession) => s.status === "completed"
    );

    const hasHistory = recentDrills.length > 0;

    return (
        <div
            className={cn(
                "rounded-2xl border overflow-hidden",
                "bg-card border-border",
                "shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06),0_4px_8px_-2px_rgba(0,0,0,0.04)]",
                "dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.2),0_4px_8px_-2px_rgba(0,0,0,0.15)]"
            )}
        >
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <PeppaAvatar size="lg" animate={isCreating} />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-foreground">
                                Special Practice
                            </h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Tell Peppa what you want to practice
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Loading State */}
                {isCreating ? (
                    <div className="py-8 space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-start gap-3">
                            <PeppaAvatar size="sm" animate />
                            <div
                                className={cn(
                                    "flex-1 p-4 rounded-2xl rounded-tl-sm",
                                    "bg-muted/50 border border-border/50",
                                    "shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.02)]"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    <p className="text-sm text-foreground font-medium animate-in fade-in duration-200" key={loadingMessageIndex}>
                                        {loadingMessages[loadingMessageIndex]}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-1.5">
                            {loadingMessages.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        i === loadingMessageIndex
                                            ? "bg-foreground scale-110"
                                            : i < loadingMessageIndex
                                                ? "bg-foreground/50"
                                                : "bg-muted-foreground/30"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="px-4 py-3 bg-muted/30 rounded-xl border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Your request:</p>
                            <p className="text-sm text-foreground line-clamp-2">{userPrompt}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Peppa Chat Bubble */}
                        <div className="flex items-start gap-3">
                            <PeppaAvatar size="sm" />
                            <div
                                className={cn(
                                    "flex-1 p-4 rounded-2xl rounded-tl-sm",
                                    "bg-muted/50 border border-border/50",
                                    "shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.02)]"
                                )}
                            >
                                <p className="text-sm text-foreground leading-relaxed">
                                    Hi! I&apos;m Peppa! Tell me what you&apos;d like to practice and I&apos;ll create a custom session for you.
                                </p>
                            </div>
                        </div>

                        {/* Example Prompts */}
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                Try these examples
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {examplePrompts.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePromptClick(example.prompt)}
                                        className={cn(
                                            "group text-left p-4 rounded-xl transition-all duration-200",
                                            "bg-background border border-border",
                                            "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.03)]",
                                            "hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)]",
                                            "hover:-translate-y-0.5",
                                            "active:translate-y-0 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)]"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg",
                                                    "bg-muted/70",
                                                    "shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.04)]"
                                                )}
                                            >
                                                <example.icon className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-foreground">
                                                    {example.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {example.description}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        {(showChat || userPrompt) && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                <Textarea
                                    placeholder="Describe your ideal practice session..."
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    className={cn(
                                        "min-h-[100px] resize-none",
                                        "bg-background border-border",
                                        "focus:ring-1 focus:ring-primary/20"
                                    )}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!userPrompt.trim()}
                                        className={cn(
                                            "font-medium",
                                            "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]",
                                            "hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)]",
                                            "active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)]"
                                        )}
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Create Session
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Show input trigger */}
                        {!showChat && !userPrompt && (
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full",
                                    "shadow-[0_2px_4px_-1px_rgba(0,0,0,0.04)]",
                                    "hover:shadow-[0_4px_8px_-2px_rgba(0,0,0,0.08)]",
                                    "active:shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.06)]"
                                )}
                                onClick={() => setShowChat(true)}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Create New Peppa Session
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* ─── Session History ────────────────────────────────────────── */}
            {hasHistory && (
                <div className="border-t border-border">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Session History
                            </h3>
                            {recentDrills.length > 5 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                                    onClick={() => router.push("/dashboard/sessions")}
                                >
                                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                                </Button>
                            )}
                        </div>

                        {/* In-progress / resumable sessions — highlighted at top */}
                        {inProgressSessions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    In Progress
                                </p>
                                {inProgressSessions.map((session: DrillSession) => (
                                    <SessionHistoryItem
                                        key={session.id}
                                        session={session}
                                        onNavigate={handleNavigateSession}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pending sessions — not started yet */}
                        {pendingSessions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                    Not Started
                                </p>
                                {pendingSessions.slice(0, 3).map((session: DrillSession) => (
                                    <SessionHistoryItem
                                        key={session.id}
                                        session={session}
                                        onNavigate={handleNavigateSession}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Completed sessions */}
                        {completedSessions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Completed
                                </p>
                                {completedSessions.slice(0, 5).map((session: DrillSession) => (
                                    <SessionHistoryItem
                                        key={session.id}
                                        session={session}
                                        onNavigate={handleNavigateSession}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
