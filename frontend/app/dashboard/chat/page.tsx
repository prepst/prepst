"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import { Markdown } from "@/components/ui/markdown";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { Loader } from "@/components/ui/loader";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowUp, Square, Brain } from "lucide-react";
import { api } from "@/lib/api";
import { ChatMessageAPI } from "@/lib/types";
import { toast } from "sonner";

const suggestionGroups = [
  {
    label: "Study Help",
    highlight: "Help me",
    items: [
      "Help me understand this concept",
      "Help me solve this problem",
      "Help me study for my exam",
      "Help me create a study plan",
    ],
  },
  {
    label: "Practice",
    highlight: "Practice",
    items: [
      "Practice math problems",
      "Practice coding questions",
      "Practice vocabulary",
      "Practice problem solving",
    ],
  },
  {
    label: "Explain",
    highlight: "Explain",
    items: [
      "Explain this topic in simple terms",
      "Explain the steps to solve this",
      "Explain the key concepts",
      "Explain with examples",
    ],
  },
  {
    label: "Generate",
    highlight: "Generate",
    items: [
      "Generate practice questions",
      "Generate study notes",
      "Generate flashcards",
      "Generate a quiz",
    ],
  },
];

interface ChatMessage {
  id: string | number;
  content: string;
  sender: "user" | "ai";
  timestamp?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content:
        "Hi! I'm your AI assistant. I can help you with writing, coding, analysis, and more. What would you like to do?",
      sender: "ai" as const,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamContentRef = useRef("");

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    // Generate unique IDs to prevent collisions
    const generateUniqueId = () => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Add user message
    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);
    setShowSuggestions(false);

    // Create AI message placeholder
    const newMessageId = generateUniqueId();
    setIsStreaming(true);
    streamContentRef.current = "";

    setMessages((prev) => [
      ...prev,
      {
        id: newMessageId,
        sender: "ai" as const,
        content: "",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      // Convert messages to API format (excluding the empty AI message we just added)
      const conversationHistory: ChatMessageAPI[] = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));

      // Call OpenAI API with streaming
      await api.chatWithAI(
        {
          message: currentInput,
          conversation_history: conversationHistory,
        },
        (chunk: string) => {
          // Update message content as chunks arrive
          streamContentRef.current += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessageId
                ? { ...msg, content: streamContentRef.current }
                : msg
            )
          );
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Please try again.");

      // Update the message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessageId
            ? {
                ...msg,
                content:
                  "Sorry, I'm having trouble responding right now. Please try again in a moment.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      streamContentRef.current = "";
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    setActiveCategory("");
  };

  const handlePromptInputValueChange = (value: string) => {
    setInputMessage(value);
    // Clear active category when typing something different
    if (value.trim() === "") {
      setActiveCategory("");
    }
  };

  // Get suggestions based on active category
  const activeCategoryData = suggestionGroups.find(
    (group) => group.label === activeCategory
  );

  // Determine which suggestions to show
  const showCategorySuggestions = activeCategory !== "";

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const chatContainer = document.querySelector(".overflow-y-auto");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-purple-500" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground">
          Get help with homework, explanations, and study guidance
        </p>
      </div>

      <Card className="h-[70vh] min-h-[500px] max-h-[800px] flex flex-col border-0 shadow-lg">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden h-full m-0">
          {/* Messages Area */}
          <ChatContainerRoot className="flex-1 overflow-y-auto max-h-[calc(70vh-120px)]">
            <ChatContainerContent className="space-y-4 p-4">
              {messages.map((message) => {
                const isAssistant = message.sender === "ai";

                return (
                  <Message
                    key={message.id}
                    className={
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  >
                    {isAssistant && (
                      <MessageAvatar
                        src="/avatars/ai.svg"
                        alt="AI Assistant"
                        fallback="AI"
                      />
                    )}
                    <div
                      className={
                        isAssistant
                          ? "max-w-[85%] flex-1 sm:max-w-[75%]"
                          : "max-w-fit"
                      }
                    >
                      {isAssistant ? (
                        <div className="text-foreground prose">
                          <Markdown>{message.content}</Markdown>
                        </div>
                      ) : (
                        <MessageContent className="bg-gray-100 text-black">
                          {message.content}
                        </MessageContent>
                      )}
                    </div>
                  </Message>
                );
              })}

              {isStreaming && (
                <Message className="justify-start">
                  <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                    <div className="text-foreground prose">
                      <div className="flex items-center gap-2">
                        <Loader variant="typing" size="sm" />
                      </div>
                    </div>
                  </div>
                </Message>
              )}
              {/* Scroll anchor for auto-scrolling */}
              <div id="scroll-anchor" />
            </ChatContainerContent>
          </ChatContainerRoot>

          {/* Input Area */}
          <div className="border-t border-gray-100 px-4 py-3 space-y-4 flex-shrink-0 mt-auto">
            <PromptInput
              value={inputMessage}
              onValueChange={handlePromptInputValueChange}
              isLoading={isStreaming}
              onSubmit={handleSendMessage}
              className="w-full"
            >
              <PromptInputTextarea placeholder="Ask me anything..." />
              <PromptInputActions className="justify-end pt-2">
                <PromptInputAction
                  tooltip={isStreaming ? "Stop generation" : "Send message"}
                >
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleSendMessage}
                  >
                    {isStreaming ? (
                      <Square className="size-5 fill-current" />
                    ) : (
                      <ArrowUp className="size-5" />
                    )}
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </PromptInput>

            {/* Suggestions under input */}
            {showSuggestions && messages.length === 1 && (
              <div className="space-y-3">
                <div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
                  {showCategorySuggestions ? (
                    <div className="flex w-full flex-col space-y-1">
                      {activeCategoryData?.items.map((suggestion) => (
                        <PromptSuggestion
                          key={suggestion}
                          highlight={activeCategoryData.highlight}
                          onClick={() => {
                            setInputMessage(suggestion);
                            setShowSuggestions(false);
                            setActiveCategory("");
                          }}
                        >
                          {suggestion}
                        </PromptSuggestion>
                      ))}
                    </div>
                  ) : (
                    <div className="relative flex w-full flex-wrap items-stretch justify-start gap-2">
                      {suggestionGroups.map((suggestion) => (
                        <PromptSuggestion
                          key={suggestion.label}
                          onClick={() => {
                            setActiveCategory(suggestion.label);
                            setInputMessage(""); // Clear input when selecting a category
                          }}
                          className="capitalize"
                        >
                          <Brain className="mr-2 h-4 w-4" />
                          {suggestion.label}
                        </PromptSuggestion>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
