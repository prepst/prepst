"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Pin,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Square,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Markdown } from "@/components/ui/markdown";
import { Loader } from "@/components/ui/loader";
import { ChatMessageAPI } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface AIExplanationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    isPinned?: boolean;
    onPinChange?: (pinned: boolean) => void;
    initialTab?: "ask" | "explanation";
    questionId?: string;
    questionContext?: {
        stem?: string;
        topic?: string;
        rationale?: string;
    };
}

interface ChatMessage {
    id: string;
    content: string;
    sender: "user" | "ai";
    timestamp: string;
}

const predefinedPrompts = [
    "Solve this with desmos",
    "Explain this step by step",
    "What concept is being tested here?",
    "What's the best strategy for this?",
];

// Storage key prefix for per-question chat
const CHAT_STORAGE_PREFIX = "prepst-question-chat-";

export function AIExplanationPanel({
    isOpen,
    onClose,
    isPinned = false,
    onPinChange,
    initialTab = "explanation",
    questionId,
    questionContext,
}: AIExplanationPanelProps) {
    const [activeTab, setActiveTab] = useState<"ask" | "explanation">(initialTab);
    const [chatMode, setChatMode] = useState<"answer" | "tutor">("answer");
    const [showModeDropdown, setShowModeDropdown] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const streamContentRef = useRef("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const prevQuestionIdRef = useRef<string | undefined>(undefined);

    // Update active tab when initialTab prop changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // Load messages from localStorage when question changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if questionId actually changed
        const questionChanged = prevQuestionIdRef.current !== questionId;
        prevQuestionIdRef.current = questionId;

        if (!questionChanged) return;

        // Reset messages when question changes
        if (!questionId) {
            setMessages([]);
            return;
        }

        const storageKey = `${CHAT_STORAGE_PREFIX}${questionId}`;
        const savedMessages = localStorage.getItem(storageKey);
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                setMessages(parsed);
            } catch (e) {
                console.error("Failed to parse chat messages", e);
                setMessages([]);
            }
        } else {
            setMessages([]);
        }
    }, [questionId]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (questionId && typeof window !== "undefined" && messages.length > 0) {
            const storageKey = `${CHAT_STORAGE_PREFIX}${questionId}`;
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, questionId]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
        }
    }, [messages, isStreaming]);

    const generateUniqueId = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleSubmit = async () => {
        if (!inputValue.trim() || isStreaming) return;

        const userMessage: ChatMessage = {
            id: generateUniqueId(),
            content: inputValue,
            sender: "user",
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue("");
        setIsStreaming(true);
        streamContentRef.current = "";

        const newMessageId = generateUniqueId();
        setMessages((prev) => [
            ...prev,
            {
                id: newMessageId,
                sender: "ai",
                content: "",
                timestamp: new Date().toISOString(),
            },
        ]);

        try {
            // Build context including the question with formatting instructions
            const formattingInstructions = `You are a concise SAT tutor. Give VERY SHORT, step-by-step solutions:
- Use numbered steps (1., 2., 3.)
- Show math equations clearly
- NO unnecessary explanations
- End with "Correct answer: [letter]. [value]"
- Be direct and to the point

`;
            const questionContextStr = questionContext?.stem
        ? `Question: "${questionContext.stem}"${
            questionContext.topic ? ` (Topic: ${questionContext.topic})` : ""
          }\n\n`
        : "";

            const conversationHistory: ChatMessageAPI[] = messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.content,
                timestamp: msg.timestamp,
            }));

            // Add system context as first message if this is the start
            if (conversationHistory.length === 0) {
                conversationHistory.unshift({
                    role: "user",
                    content: `[System: ${formattingInstructions}${questionContextStr}]`,
                    timestamp: new Date().toISOString(),
                });
            }

            await api.chatWithAI(
                {
                    message: questionContextStr + currentInput,
                    conversation_history: conversationHistory,
                },
                (chunk: string) => {
                    streamContentRef.current += chunk;
                    const currentContent = streamContentRef.current;
                    setMessages((prev) =>
                        prev.map((msg) =>
              msg.id === newMessageId
                ? { ...msg, content: currentContent }
                : msg
                        )
                    );
                }
            );
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === newMessageId
                        ? {
                            ...msg,
                content:
                  "Sorry, I'm having trouble responding right now. Please try again.",
                        }
                        : msg
                )
            );
        } finally {
            setIsStreaming(false);
            streamContentRef.current = "";
        }
    };

    const handlePromptClick = (prompt: string) => {
        setInputValue(prompt);
        // Auto-send the prompt
        setTimeout(() => {
            const userMessage: ChatMessage = {
                id: generateUniqueId(),
                content: prompt,
                sender: "user",
                timestamp: new Date().toISOString(),
            };
      setMessages((prev) => [...prev, userMessage]);
            setInputValue("");
            // Trigger the AI response
            handleSendMessage(prompt);
        }, 0);
    };

    const handleSendMessage = async (messageContent: string) => {
        const aiMessageId = generateUniqueId();
        const aiPlaceholder: ChatMessage = {
            id: aiMessageId,
            content: "",
            sender: "ai",
            timestamp: new Date().toISOString(),
        };
    setMessages((prev) => [...prev, aiPlaceholder]);
        setIsStreaming(true);
        streamContentRef.current = "";

        try {
            const formattingInstructions = `You are an ultra-concise SAT tutor. Rules:
- Maximum 3-4 short lines per response
- Use numbered steps ONLY when solving
- NO explanations, NO fluff, NO "Let me explain"
- End with: "Answer: [letter]" or the value
- Be extremely brief

`;
            const questionContextStr = questionContext?.stem
        ? `Question: "${questionContext.stem}"${
            questionContext.topic ? ` (Topic: ${questionContext.topic})` : ""
          }\n\n`
        : "";

            const conversationHistory: ChatMessageAPI[] = messages.map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.content,
                timestamp: msg.timestamp,
            }));

            // Add system context
            conversationHistory.unshift({
                role: "user",
                content: `[System: ${formattingInstructions}${questionContextStr}]`,
                timestamp: new Date().toISOString(),
            });

            await api.chatWithAI(
                {
                    message: messageContent,
                    conversation_history: conversationHistory,
                },
                (chunk: string) => {
                    streamContentRef.current += chunk;
                    const currentContent = streamContentRef.current;
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === aiMessageId ? { ...msg, content: currentContent } : msg
                        )
                    );
                }
            );
        } catch (error) {
            console.error("Error getting AI response:", error);
      setMessages((prev) =>
        prev.map((msg) =>
                    msg.id === aiMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
              }
                        : msg
                )
            );
        } finally {
            setIsStreaming(false);
            streamContentRef.current = "";
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        if (questionId && typeof window !== "undefined") {
            localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${questionId}`);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && !isPinned && (
                <div
                    className="fixed inset-0 bg-black/20 z-[99] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    "fixed inset-0 z-[100] flex h-dvh w-full flex-col bg-background text-foreground",
                    "sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[420px] sm:border-l sm:border-border",
                    "transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="shrink-0 border-b border-border px-3 pb-3 pt-3">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            onClick={() => onPinChange?.(!isPinned)}
                            className={cn(
                                "hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors sm:flex",
                                isPinned
                                    ? "bg-muted text-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Pin className="w-4 h-4" />
                            {isPinned ? "Unpin" : "Pin to side"}
                        </button>
                        <button
                            onClick={onClose}
                            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                        <button
                            onClick={() => setActiveTab("explanation")}
                            className={cn(
                                "h-10 rounded-lg text-sm font-medium",
                                activeTab === "explanation"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            Explanation
                        </button>
                        <button
                            onClick={() => setActiveTab("ask")}
                            className={cn(
                                "h-10 rounded-lg text-sm font-medium",
                                activeTab === "ask"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            Ask tutor
                        </button>
                    </div>
                </div>

                {/* Subheader */}
                {activeTab === "ask" ? (
                    <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b border-border">
                        <div className="relative">
                            <button
                                onClick={() => setShowModeDropdown(!showModeDropdown)}
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                                {chatMode === "answer" ? "Answer Mode" : "Tutor Mode"}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {showModeDropdown && (
                                <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                                    <button
                    onClick={() => {
                      setChatMode("answer");
                      setShowModeDropdown(false);
                    }}
                                        className={cn(
                                            "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                                            chatMode === "answer" && "text-foreground font-medium"
                                        )}
                                    >
                                        Answer Mode
                                    </button>
                                    <button
                    onClick={() => {
                      setChatMode("tutor");
                      setShowModeDropdown(false);
                    }}
                                        className={cn(
                                            "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                                            chatMode === "tutor" && "text-foreground font-medium"
                                        )}
                                    >
                                        Tutor Mode
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleClearChat}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            + New Chat
                        </button>
                    </div>
                ) : null}

                {/* Main Content */}
        <div
          ref={chatContainerRef}
          className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-5 sm:px-6"
        >
                    {activeTab === "ask" ? (
                        messages.length === 0 ? (
                            /* Empty state with prompts */
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#9ed4f3] bg-[#d7eefb] text-[#0c3d5c]">
                                    <MessageCircle className="h-7 w-7" />
                                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  How can I help?
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Ask a question
                </p>

                                <div className="w-full space-y-3 mb-8">
                                    {predefinedPrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePromptClick(prompt)}
                                            className="w-full px-4 py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl text-foreground text-sm font-medium transition-all "
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>

                            </div>
                        ) : (
                            /* Chat messages */
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "flex gap-3",
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                                            )}
                                        >
                                            {message.sender === "ai" ? (
                                                <div className="flex flex-col gap-2 max-w-[85%]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#9ed4f3] bg-[#d7eefb] text-[#0c3d5c]">
                                                            <MessageCircle className="h-3.5 w-3.5" />
                                                        </div>
                            <span className="text-sm font-medium text-foreground">
                              Tutor
                            </span>
                                                    </div>
                                                    <div className="px-4 py-3 text-foreground">
                                                        {message.content ? (
                                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                                <Markdown>
                                                                    {/* Show only complete lines while streaming to avoid broken LaTeX */}
                                  {isStreaming &&
                                  messages[messages.length - 1]?.id ===
                                    message.id
                                                                        ? (() => {
                                                                            let content = message.content;
                                                                            // Find and remove last incomplete line (no newline at end)
                                        const lastNewline =
                                          content.lastIndexOf("\n");
                                                                            // Check for incomplete LaTeX (odd $ count)
                                        const dollarCount = (
                                          content.match(/\$/g) || []
                                        ).length;
                                        const hasIncompleteLatex =
                                          dollarCount % 2 !== 0;
                                                                            // Check for incomplete inline LaTeX \( or \[
                                        const openParens = (
                                          content.match(/\\\(/g) || []
                                        ).length;
                                        const closeParens = (
                                          content.match(/\\\)/g) || []
                                        ).length;
                                        const openBrackets = (
                                          content.match(/\\\[/g) || []
                                        ).length;
                                        const closeBrackets = (
                                          content.match(/\\\]/g) || []
                                        ).length;
                                        const hasIncompleteBlock =
                                          openParens !== closeParens ||
                                          openBrackets !== closeBrackets;

                                        if (
                                          hasIncompleteLatex ||
                                          hasIncompleteBlock
                                        ) {
                                                                                // Truncate to last complete line
                                                                                if (lastNewline > 0) {
                                            content = content.substring(
                                              0,
                                              lastNewline
                                            );
                                                                                } else {
                                            content = "";
                                                                                }
                                                                            }
                                                                            return content;
                                                                        })()
                                    : message.content}
                                                                </Markdown>
                                {isStreaming &&
                                  messages[messages.length - 1]?.id ===
                                    message.id && (
                                                                    <span className="inline-block w-2 h-4 bg-foreground/50 animate-pulse ml-1" />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Loader variant="typing" size="sm" />
                                <span className="text-sm italic">
                                  Thinking...
                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 items-start">
                                                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground">
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs text-foreground">ME</span>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )
                    ) : (
                        <div className="space-y-6">
                            {questionContext?.rationale ? (
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: questionContext.rationale,
                                    }}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No explanation for this question yet.
                                </p>
                            )}
                        </div>
                    )}
        </div>

                {/* Footer */}
        <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    {activeTab === "ask" ? (
                        <div className="flex items-center gap-2 bg-muted rounded-xl border border-border p-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSubmit()
                }
                                placeholder="Ask a question..."
                                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-sm outline-none px-2"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!inputValue.trim() && !isStreaming}
                                className={cn(
                                    "p-2 rounded-full transition-all",
                                    inputValue.trim() || isStreaming
                                        ? "bg-foreground text-background hover:opacity-90"
                                        : "bg-muted-foreground/20 text-muted-foreground"
                                )}
                            >
                                {isStreaming ? (
                                    <Square className="w-4 h-4 fill-current" />
                                ) : (
                                    <ArrowUp className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setActiveTab("ask")}
                            className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#9ed4f3] bg-[#d7eefb] text-[#0c3d5c]">
                                    <MessageCircle className="h-4 w-4" />
                                </div>
                <span className="text-muted-foreground text-sm">
                  Got a question? Ask the tutor
                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
        </div>
      </div>
        </>
    );
}
