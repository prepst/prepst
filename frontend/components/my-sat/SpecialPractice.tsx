"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, ArrowRight, Loader2, Zap, Target, Brain, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ExamplePrompt {
    icon: React.ElementType;
    title: string;
    description: string;
    prompt: string;
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

// Loading messages for the session creation
const loadingMessages = [
    "Analyzing your mastery levels across topics...",
    "Reviewing your recent practice performance...",
    "Identifying areas that need more attention...",
    "Selecting questions tailored to your skill level...",
    "Balancing difficulty for optimal learning...",
    "Curating the perfect practice session...",
];

// Elegant Peppa avatar - minimal, premium
const PeppaAvatar = ({ size = "lg", animate = false }: { size?: "sm" | "lg"; animate?: boolean }) => {
    const sizeClasses = size === "lg" ? "w-14 h-14" : "w-10 h-10";
    const svgSize = size === "lg" ? "w-10 h-10" : "w-7 h-7";

    return (
        <div
            className={cn(
                sizeClasses,
                "rounded-2xl flex items-center justify-center",
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

    // Rotate loading messages when creating
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

        // Wait for loading messages to cycle through a few times
        setTimeout(() => {
            router.push("/dashboard/drill");
            toast.success("Custom session ready!");
            setIsCreating(false);
        }, 5000);
    };

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
                {/* Loading State - Full screen takeover */}
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

                        {/* Progress dots */}
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

                        {/* User's request echo */}
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
                                    Hi! I'm <span className="font-semibold">Peppa</span>!
                                    Tell me what you'd like to practice and I'll create a custom session for you.
                                    You can specify topics, difficulty, and number of questions.
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
                                    disabled={isCreating}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isCreating || !userPrompt.trim()}
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

                        {/* Show input trigger if hidden */}
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
                                Create Custom Practice
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
