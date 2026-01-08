"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, ArrowRight, Loader2, Zap, Target, Brain, BookOpen, Clock, RotateCcw, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ExamplePrompt {
    icon: React.ElementType;
    title: string;
    description: string;
    prompt: string;
}

interface PeppaSession {
    id: string;
    prompt: string;
    title: string;
    createdAt: string;
    timesCompleted: number;
}

const examplePrompts: ExamplePrompt[] = [
    {
        icon: Zap,
        title: "Quick Math Drill",
        description: "5 hard questions on Quadratics",
        prompt: "Create a session with 5 hard Math questions focusing on Quadratic Functions and Linear Equations",
    },
    {
        icon: BookOpen,
        title: "Reading Warmup",
        description: "10 easy Reading & Writing questions",
        prompt: "Create a warmup session with 10 easy Reading & Writing questions covering Text Structure and Main Ideas",
    },
    {
        icon: Target,
        title: "Mixed Challenge",
        description: "Medium & Hard Geometry and Algebra",
        prompt: "Create a mixed session with 8 medium and hard questions from Geometry, Circles, and Algebraic Expressions",
    },
    {
        icon: Brain,
        title: "Focus on Weaknesses",
        description: "Target topics I need to improve",
        prompt: "Create a personalized session focusing on my weakest topics based on my performance data. Include 10 questions of varying difficulty",
    },
];

const loadingMessages = [
    "Analyzing your mastery levels across topics...",
    "Reviewing your recent practice performance...",
    "Identifying areas that need more attention...",
    "Selecting questions tailored to your skill level...",
    "Balancing difficulty for optimal learning...",
    "Curating the perfect practice session...",
];

const STORAGE_KEY = "peppa-sessions";

// Generate a session title from the prompt
const generateSessionTitle = (prompt: string): string => {
    const words = prompt.toLowerCase();
    if (words.includes("math") && words.includes("hard")) return "Hard Math Drill";
    if (words.includes("math")) return "Math Practice";
    if (words.includes("reading") && words.includes("easy")) return "Easy Reading Warmup";
    if (words.includes("reading")) return "Reading Practice";
    if (words.includes("geometry")) return "Geometry Focus";
    if (words.includes("algebra")) return "Algebra Session";
    if (words.includes("weak")) return "Weakness Review";
    if (words.includes("mixed") || words.includes("challenge")) return "Mixed Challenge";
    return "Custom Practice";
};

// Peppa avatar component
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

export function SpecialPractice() {
    const router = useRouter();
    const [userPrompt, setUserPrompt] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [peppaSessions, setPeppaSessions] = useState<PeppaSession[]>([]);
    const [showAllSessions, setShowAllSessions] = useState(false);

    // Load sessions from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setPeppaSessions(JSON.parse(stored));
            } catch {
                setPeppaSessions([]);
            }
        }
    }, []);

    // Rotate loading messages
    useEffect(() => {
        if (!isCreating) {
            setLoadingMessageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 1200);
        return () => clearInterval(interval);
    }, [isCreating]);

    const saveSessions = (sessions: PeppaSession[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        setPeppaSessions(sessions);
    };

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

        // Create new session
        const newSession: PeppaSession = {
            id: Date.now().toString(),
            prompt: userPrompt,
            title: generateSessionTitle(userPrompt),
            createdAt: new Date().toISOString(),
            timesCompleted: 0,
        };

        setTimeout(() => {
            // Save session
            const updatedSessions = [newSession, ...peppaSessions];
            saveSessions(updatedSessions);

            router.push("/dashboard/drill");
            toast.success("Peppa Session created!");
            setIsCreating(false);
            setUserPrompt("");
            setShowChat(false);
        }, 5000);
    };

    const handleRedoSession = (session: PeppaSession) => {
        // Update times completed
        const updated = peppaSessions.map((s) =>
            s.id === session.id ? { ...s, timesCompleted: s.timesCompleted + 1 } : s
        );
        saveSessions(updated);

        toast.success(`Starting "${session.title}"`);
        router.push("/dashboard/drill");
    };

    const handleDeleteSession = (sessionId: string) => {
        const updated = peppaSessions.filter((s) => s.id !== sessionId);
        saveSessions(updated);
        toast.success("Session deleted");
    };

    const visibleSessions = showAllSessions ? peppaSessions : peppaSessions.slice(0, 3);

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
                        {/* Saved Peppa Sessions */}
                        {peppaSessions.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Your Peppa Sessions
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                        {peppaSessions.length} saved
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {visibleSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className={cn(
                                                "group p-4 rounded-xl transition-all duration-200",
                                                "bg-background border border-border",
                                                "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]",
                                                "hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#fce4ec] dark:bg-[#3d2a2f] flex items-center justify-center shrink-0">
                                                    <Sparkles className="w-4 h-4 text-[#ad1457]" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-foreground truncate">
                                                        {session.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                                                        {session.timesCompleted > 0 && (
                                                            <span className="ml-2">• Completed {session.timesCompleted}x</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRedoSession(session)}
                                                        className="h-8 px-2 text-xs"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                                        Redo
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteSession(session.id)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {peppaSessions.length > 3 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllSessions(!showAllSessions)}
                                        className="w-full text-xs text-muted-foreground"
                                    >
                                        <ChevronDown className={cn("w-4 h-4 mr-1 transition-transform", showAllSessions && "rotate-180")} />
                                        {showAllSessions ? "Show less" : `Show ${peppaSessions.length - 3} more`}
                                    </Button>
                                )}
                            </div>
                        )}

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
                                    {peppaSessions.length > 0
                                        ? "Want to create another session? Tell me what you'd like to practice!"
                                        : "Hi! I'm Peppa! Tell me what you'd like to practice and I'll create a custom session for you."
                                    }
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
        </div>
    );
}
