"use client";

import { useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { useSavedQuestions } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { QuestionPracticePopup } from "@/components/revision/QuestionPracticePopup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processQuestionBlanks, formatTopicName } from "@/lib/question-utils";
import type { SavedQuestion } from "@/lib/types";
import type { SessionQuestion } from "@/lib/types";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ONBOARDING_CONTENT } from "@/lib/onboardingContent";

function SavedQuestionsContent() {
  const { data: savedQuestions = [], isLoading: loadingSavedQuestions } =
    useSavedQuestions(20);

  const [selectedQuestion, setSelectedQuestion] =
    useState<SessionQuestion | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [savedQuestionsSort, setSavedQuestionsSort] =
    useState<string>("recent");
  const [timeRange, setTimeRange] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibleSavedQuestionsCount, setVisibleSavedQuestionsCount] =
    useState(5);

  // Process question text for proper HTML/MathML rendering
  const processQuestionText = (text?: string | null): string => {
    if (!text) return "";
    return processQuestionBlanks(text);
  };

  // Transform SavedQuestion to SessionQuestion format
  const transformToSessionQuestion = (
    item: SavedQuestion
  ): SessionQuestion | null => {
    if (!item.question || !item.topic) {
      return null;
    }
    return {
      session_question_id: item.session_question_id,
      question: item.question as any,
      topic: {
        id: item.topic.id,
        name: item.topic.name,
        category_id: item.topic.category || "",
        weight_in_category: 0,
      } as any,
      status:
        item.user_answer && item.user_answer.length > 0
          ? "answered"
          : "not_started",
      display_order: 0,
      user_answer: item.user_answer,
      is_saved: true,
    } as SessionQuestion;
  };

  const handleQuestionClick = (item: SavedQuestion) => {
    const sessionQuestion = transformToSessionQuestion(item);
    if (sessionQuestion) {
      setSelectedQuestion(sessionQuestion);
      setIsPopupOpen(true);
    }
  };

  // Filter and sort saved questions
  const sortedSavedQuestions = useMemo(() => {
    let filtered = [...savedQuestions];

    // Apply time range filter
    if (timeRange !== "all" && filtered.length > 0) {
      const now = new Date().getTime();
      let daysAgo = 0;
      if (timeRange === "7") daysAgo = 7;
      else if (timeRange === "30") daysAgo = 30;
      else if (timeRange === "90") daysAgo = 90;

      const cutoffDate = now - daysAgo * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((savedQuestion) => {
        if (!savedQuestion.session?.created_at) return false;
        const savedDate = new Date(savedQuestion.session.created_at).getTime();
        return savedDate >= cutoffDate;
      });
    }

    // Apply category filter
    if (categoryFilter !== "all" && filtered.length > 0) {
      filtered = filtered.filter((savedQuestion) => {
        const section = savedQuestion.topic?.section;
        if (categoryFilter === "math") {
          return section === "math";
        } else if (categoryFilter === "rw") {
          return section === "reading_writing";
        }
        return true;
      });
    }

    if (savedQuestionsSort === "recent") {
      return filtered.sort((a, b) => {
        const dateA = a.session?.created_at
          ? new Date(a.session.created_at).getTime()
          : 0;
        const dateB = b.session?.created_at
          ? new Date(b.session.created_at).getTime()
          : 0;
        return dateB - dateA;
      });
    } else if (savedQuestionsSort === "oldest") {
      return filtered.sort((a, b) => {
        const dateA = a.session?.created_at
          ? new Date(a.session.created_at).getTime()
          : 0;
        const dateB = b.session?.created_at
          ? new Date(b.session.created_at).getTime()
          : 0;
        return dateA - dateB;
      });
    } else if (savedQuestionsSort === "topic") {
      return filtered.sort((a, b) => {
        const topicA = a.topic?.name || "";
        const topicB = b.topic?.name || "";
        return topicA.localeCompare(topicB);
      });
    }
    return filtered;
  }, [savedQuestions, savedQuestionsSort, timeRange, categoryFilter]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                <Bookmark className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Saved Questions
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                Saved Questions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Review questions you've bookmarked for later practice.
              </p>
            </div>
          </div>

          {/* Saved Questions Section */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bookmark className="w-6 h-6 text-primary" />
                  </div>
                  Saved Questions
                </h2>
                <p className="text-muted-foreground text-sm mt-1 ml-14">
                  Questions you've bookmarked for later review.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="rw">RW</SelectItem>
                    <SelectItem value="math">Math</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={timeRange}
                  onValueChange={setTimeRange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={savedQuestionsSort}
                  onValueChange={setSavedQuestionsSort}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="topic">By Topic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {loadingSavedQuestions ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-2xl p-6 bg-background"
                    >
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedSavedQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 border-2 border-dashed border-border rounded-3xl">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Bookmark className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Saved Questions
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Bookmark questions during practice sessions to review them
                    later.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {sortedSavedQuestions
                      .slice(0, visibleSavedQuestionsCount)
                      .map((savedQuestion: any) => (
                        <button
                          key={savedQuestion.session_question_id}
                          className="group relative w-full text-left bg-background border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300"
                          onClick={() => handleQuestionClick(savedQuestion)}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              {/* Show stimulus (graphs/tables) if available */}
                              {(savedQuestion.question as any)?.stimulus && (
                                <div
                                  className="mb-3 prose prose-sm dark:prose-invert max-w-none [&_svg]:max-h-[120px] [&_img]:max-h-[120px] [&_table]:text-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: processQuestionText(
                                      (savedQuestion.question as any).stimulus
                                    ),
                                  }}
                                />
                              )}
                              <div
                                className="text-lg font-medium text-foreground line-clamp-2 leading-relaxed mb-3 group-hover:text-primary transition-colors prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: processQuestionText(
                                    savedQuestion.question?.stem
                                  ),
                                }}
                              />
                              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                <span
                                  className="px-2 py-1 bg-muted rounded-md truncate max-w-[200px]"
                                  title={
                                    savedQuestion.topic?.name ||
                                    "Unknown Topic"
                                  }
                                >
                                  {formatTopicName(
                                    savedQuestion.topic?.name ||
                                    "Unknown Topic"
                                  )}
                                </span>
                                <span>•</span>
                                <span>
                                  {savedQuestion.session?.created_at
                                    ? new Date(
                                      savedQuestion.session.created_at
                                    ).toLocaleDateString()
                                    : "Unknown Date"}
                                </span>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                  {visibleSavedQuestionsCount <
                    sortedSavedQuestions.length && (
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setVisibleSavedQuestionsCount((prev) =>
                              Math.min(prev + 5, sortedSavedQuestions.length)
                            )
                          }
                          className="border-border hover:bg-accent text-foreground"
                        >
                          Show More
                        </Button>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Practice Popup */}
      {selectedQuestion && (
        <QuestionPracticePopup
          open={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          question={selectedQuestion}
          onComplete={() => {
            // Saved questions don't need special handling on complete
          }}
        />
      )}
    </div>
  );
}

export default function SavedQuestionsPage() {
  return (
    <ProtectedRoute>
      <SavedQuestionsContent />
      <OnboardingModal pageId="saved" steps={ONBOARDING_CONTENT.saved} />
    </ProtectedRoute>
  );
}
