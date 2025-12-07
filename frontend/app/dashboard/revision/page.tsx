"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Bookmark } from "lucide-react";
import { useWrongAnswers, useSavedQuestions } from "@/hooks/queries";
import { useCreateRevisionSession } from "@/hooks/mutations";
import { Skeleton } from "@/components/ui/skeleton";

export default function RevisionPage() {
  // Use TanStack Query hooks for data fetching
  const { data: wrongAnswers = [], isLoading: loadingWrongAnswers } = useWrongAnswers(20);
  const { data: savedQuestions = [], isLoading: loadingSavedQuestions } = useSavedQuestions(20);
  const createRevisionMutation = useCreateRevisionSession();

  const [creatingSessionId, setCreatingSessionId] = useState<string | null>(null);

  // Safely strip HTML. If stem is null/undefined, show a fallback to avoid runtime errors
  const stripHtml = (
    html?: string | null,
    fallback: string = "Question text unavailable"
  ) => (typeof html === "string" ? html.replace(/<[^>]*>/g, "") : fallback);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Revision Sessions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Review and reinforce your knowledge by practicing questions you missed.
            </p>
          </div>

          {/* Wrong Answers Section */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-destructive" />
                  </div>
                  Missed Questions
                </h2>
                <p className="text-muted-foreground text-sm mt-1 ml-14">
                  Questions you answered incorrectly. Select one to practice similar questions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {loadingWrongAnswers ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-2xl p-6 bg-background">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : wrongAnswers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 border-2 border-dashed border-border rounded-3xl">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Wrong Answers Yet
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Great job! Start practicing to see questions you need to review here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {wrongAnswers.map((wrongAnswer) => (
                    <button
                      key={wrongAnswer.session_question_id}
                      className="group relative w-full text-left bg-background border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={creatingSessionId !== null}
                      onClick={() => {
                        if (!wrongAnswer.session) return;
                        setCreatingSessionId(wrongAnswer.session.id);
                        createRevisionMutation.mutate(
                          { sessionId: wrongAnswer.session.id, numQuestions: 1 },
                          {
                            onSuccess: (result: any) => {
                              if (result.success) {
                                window.location.href = `/practice/${result.session_id}`;
                              }
                            },
                            onError: (error) => {
                              console.error(error);
                              setCreatingSessionId(null);
                            },
                          }
                        );
                      }}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-lg font-medium text-foreground line-clamp-2 leading-relaxed mb-3 group-hover:text-primary transition-colors">
                            {stripHtml(wrongAnswer.question?.stem)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            <span className="px-2 py-1 bg-muted rounded-md">
                              {wrongAnswer.topic?.name || "Unknown Topic"}
                            </span>
                            <span>•</span>
                            <span>
                              {wrongAnswer.session?.created_at 
                                ? new Date(wrongAnswer.session.created_at).toLocaleDateString() 
                                : "Unknown Date"}
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Saved Questions Section */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
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
            </div>

            <div className="space-y-4">
              {loadingSavedQuestions ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-2xl p-6 bg-background">
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 border-2 border-dashed border-border rounded-3xl">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Bookmark className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Saved Questions
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Bookmark questions during practice sessions to review them later.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedQuestions.map((savedQuestion: any) => (
                    <button
                      key={savedQuestion.session_question_id}
                      className="group relative w-full text-left bg-background border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={creatingSessionId !== null}
                      onClick={() => {
                        if (!savedQuestion.session) return;
                        setCreatingSessionId(savedQuestion.session.id);
                        createRevisionMutation.mutate(
                          { sessionId: savedQuestion.session.id, numQuestions: 1 },
                          {
                            onSuccess: (result: any) => {
                              if (result.success) {
                                window.location.href = `/practice/${result.session_id}`;
                              }
                            },
                            onError: (error) => {
                              console.error(error);
                              setCreatingSessionId(null);
                            },
                          }
                        );
                      }}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-lg font-medium text-foreground line-clamp-2 leading-relaxed mb-3 group-hover:text-primary transition-colors">
                            {stripHtml(savedQuestion.question?.stem)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            <span className="px-2 py-1 bg-muted rounded-md">
                              {savedQuestion.topic?.name || "Unknown Topic"}
                            </span>
                            <span>•</span>
                            <span>
                              {savedQuestion.session?.created_at
                                ? new Date(savedQuestion.session.created_at).toLocaleDateString()
                                : "Unknown Date"}
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
