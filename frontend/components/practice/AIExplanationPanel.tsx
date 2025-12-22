"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Pin,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  Square,
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
  initialTab = "ask",
  questionId,
  questionContext,
}: AIExplanationPanelProps) {
  const [activeTab, setActiveTab] = useState<"ask" | "explanation">(initialTab);
  const [explanationMode, setExplanationMode] = useState<"step" | "full">(
    "step"
  );
  const [currentStep, setCurrentStep] = useState(1);
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
      const formattingInstructions = `You are Peppa, an ultra-concise SAT tutor. Rules:
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

  // Mock steps for demonstration
  const steps = [
    {
      title: "Identify length and width",
      content: "First, let's define the dimensions based on the text:",
      bullets: ["Width: x", "Length: x + 18"],
    },
    {
      title: "Write the perimeter formula",
      content: "The perimeter of a rectangle is:",
      bullets: ["P = 2(length + width)", "P = 2(x + 18 + x)"],
    },
    {
      title: "Simplify the expression",
      content: "Combine like terms:",
      bullets: ["P = 2(2x + 18)", "P = 4x + 36"],
    },
  ];

  const currentStepData = steps[currentStep - 1];

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
          "fixed top-0 right-0 h-full w-[420px] z-[100] flex flex-col",
          // Light mode: use app background, dark mode: Peppa black
          "bg-background text-foreground dark:bg-[#0a0a0a] dark:text-slate-100",
          "border-l border-border dark:border-neutral-800",
          "transform transition-transform duration-300 ease-out shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={() => onPinChange?.(!isPinned)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
              isPinned
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Pin className="w-4 h-4" />
            {isPinned ? "Unpin" : "Pin to side"}
          </button>

          <div className="flex items-center bg-muted rounded-full p-1">
            <button
              onClick={() => setActiveTab("ask")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === "ask"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Ask Peppa
            </button>
            <button
              onClick={() => setActiveTab("explanation")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === "explanation"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Explanation
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
            <button
              onClick={() => setExplanationMode("step")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                explanationMode === "step"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Step-by-Step
            </button>
            <button
              onClick={() => setExplanationMode("full")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                explanationMode === "full"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Full Explanation
            </button>
          </div>
        )}

        {/* Main Content */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6 bg-background dark:bg-[#0a0a0a]"
        >
          {activeTab === "ask" ? (
            messages.length === 0 ? (
              /* Empty state with prompts */
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 mb-6">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient
                        id="pigGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#FFB6C1" />
                        <stop offset="100%" stopColor="#FF69B4" />
                      </linearGradient>
                    </defs>
                    {/* Ears */}
                    <ellipse
                      cx="25"
                      cy="25"
                      rx="12"
                      ry="15"
                      fill="url(#pigGradient)"
                      transform="rotate(-20 25 25)"
                    />
                    <ellipse
                      cx="75"
                      cy="25"
                      rx="12"
                      ry="15"
                      fill="url(#pigGradient)"
                      transform="rotate(20 75 25)"
                    />
                    <ellipse
                      cx="25"
                      cy="25"
                      rx="6"
                      ry="8"
                      fill="#FF1493"
                      transform="rotate(-20 25 25)"
                    />
                    <ellipse
                      cx="75"
                      cy="25"
                      rx="6"
                      ry="8"
                      fill="#FF1493"
                      transform="rotate(20 75 25)"
                    />
                    {/* Face */}
                    <circle cx="50" cy="55" r="35" fill="url(#pigGradient)" />
                    {/* Eyes */}
                    <circle cx="38" cy="48" r="6" fill="#1a1a2e" />
                    <circle cx="62" cy="48" r="6" fill="#1a1a2e" />
                    <circle cx="40" cy="46" r="2" fill="white" />
                    <circle cx="64" cy="46" r="2" fill="white" />
                    {/* Snout */}
                    <ellipse cx="50" cy="65" rx="14" ry="10" fill="#FF69B4" />
                    {/* Nostrils */}
                    <ellipse cx="45" cy="65" rx="3" ry="4" fill="#FF1493" />
                    <ellipse cx="55" cy="65" rx="3" ry="4" fill="#FF1493" />
                    {/* Blush */}
                    <circle
                      cx="25"
                      cy="58"
                      r="6"
                      fill="#FF69B4"
                      opacity="0.5"
                    />
                    <circle
                      cx="75"
                      cy="58"
                      r="6"
                      fill="#FF69B4"
                      opacity="0.5"
                    />
                    {/* Smile */}
                    <path
                      d="M 40 75 Q 50 82 60 75"
                      stroke="#FF1493"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  How can I help?
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  Ask Peppa any question!
                </p>

                <div className="w-full space-y-3 mb-8">
                  {predefinedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full px-4 py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl text-foreground text-sm font-medium transition-all hover:scale-[1.02]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-[10px] text-white">◆</span>
                    </div>
                    <span className="text-foreground">
                      You have{" "}
                      <span className="text-cyan-500 font-semibold">24</span>{" "}
                      orbs remaining
                    </span>
                  </div>
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
                            <div className="w-6 h-6 flex items-center justify-center">
                              <svg viewBox="0 0 100 100" className="w-5 h-5">
                                <circle cx="50" cy="55" r="30" fill="#FF69B4" />
                                <ellipse
                                  cx="50"
                                  cy="60"
                                  rx="10"
                                  ry="7"
                                  fill="#FF1493"
                                />
                                <ellipse
                                  cx="45"
                                  cy="60"
                                  rx="2"
                                  ry="3"
                                  fill="#C71585"
                                />
                                <ellipse
                                  cx="55"
                                  cy="60"
                                  rx="2"
                                  ry="3"
                                  fill="#C71585"
                                />
                                <circle cx="38" cy="48" r="4" fill="#1a1a2e" />
                                <circle cx="62" cy="48" r="4" fill="#1a1a2e" />
                                <circle cx="39" cy="47" r="1.5" fill="white" />
                                <circle cx="63" cy="47" r="1.5" fill="white" />
                              </svg>
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              Peppa
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
                                  Peppa is thinking...
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
          ) : explanationMode === "step" ? (
            /* Step-by-Step Explanation */
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-foreground">
                  Step {currentStep}: {currentStepData?.title}
                </h3>
              </div>

              {questionContext?.stem && (
                <div className="text-muted-foreground leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: questionContext.stem.replace(
                        /(width|length|garden|feet)/gi,
                        '<span class="bg-cyan-500/30 px-1 rounded">$1</span>'
                      ),
                    }}
                  />
                </div>
              )}

              <div className="border-t border-dashed border-border" />

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {currentStepData?.content}
                </p>
                {currentStepData?.bullets && (
                  <ul className="space-y-2">
                    {currentStepData.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: bullet.replace(/x/g, "<em>x</em>"),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() =>
                    setCurrentStep(Math.min(currentStep + 1, steps.length))
                  }
                  disabled={currentStep >= steps.length}
                  className="flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-foreground text-sm font-medium transition-all disabled:opacity-50"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExplanationMode("full")}
                  className="px-5 py-2.5 bg-background hover:bg-muted border border-border rounded-xl text-muted-foreground text-sm font-medium transition-all"
                >
                  Show all steps
                </button>
              </div>
            </div>
          ) : (
            /* Full Explanation */
            <div className="space-y-6">
              {questionContext?.rationale ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: questionContext.rationale,
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {steps.map((step, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-foreground">
                          Step {i + 1}: {step.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground ml-6">
                        {step.content}
                      </p>
                      {step.bullets && (
                        <ul className="space-y-1 ml-6">
                          {step.bullets.map((bullet, j) => (
                            <li
                              key={j}
                              className="flex items-center gap-2 text-foreground"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: bullet.replace(/x/g, "<em>x</em>"),
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
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
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-6 h-6">
                    <circle cx="50" cy="55" r="30" fill="#FF69B4" />
                    <ellipse cx="50" cy="60" rx="10" ry="7" fill="#FF1493" />
                    <ellipse cx="45" cy="60" rx="2" ry="3" fill="#C71585" />
                    <ellipse cx="55" cy="60" rx="2" ry="3" fill="#C71585" />
                    <circle cx="38" cy="48" r="4" fill="#1a1a2e" />
                    <circle cx="62" cy="48" r="4" fill="#1a1a2e" />
                    <circle cx="39" cy="47" r="1.5" fill="white" />
                    <circle cx="63" cy="47" r="1.5" fill="white" />
                  </svg>
                </div>
                <span className="text-muted-foreground text-sm">
                  Got a question? Ask Peppa Chat
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
