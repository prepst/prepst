"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  ChevronDown,
  Zap,
  Lightbulb,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  QuestionResult,
  TopicPerformance,
  SessionQuestion,
  SessionQuestionsResponse,
  TopicMasteryImprovement,
  SessionSummaryResponse,
} from "@/lib/types";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SummaryContent() {
  const params = useParams();
  const router = useRouter();

  // Extract sessionId with proper handling
  let sessionId = "";
  const rawValue = params.sessionId;

  if (typeof rawValue === "string") {
    let trimmed = rawValue.trim();
    // Handle URL encoded values first
    if (trimmed.includes("%")) {
      try {
        trimmed = decodeURIComponent(trimmed);
      } catch {
        // ignore decode errors
      }
    }

    // Check if it looks like a JSON object (starts with {)
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        // Attempt standard JSON parse
        const parsed = JSON.parse(trimmed);
        sessionId = parsed.id || parsed.sessionId || parsed.value || "";
      } catch {
        // If JSON parsing fails (e.g. single quotes), try to extract UUID with regex
        // Matches standard UUID format: 8-4-4-4-12 hex digits
        const uuidMatch = trimmed.match(
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
        );
        if (uuidMatch) {
          sessionId = uuidMatch[0];
        } else {
          // Fallback: try to parse single-quoted JSON by replacing ' with "
          try {
            const fixedJson = trimmed.replace(/'/g, '"');
            const parsed = JSON.parse(fixedJson);
            sessionId = parsed.id || parsed.sessionId || parsed.value || "";
          } catch {
            // Give up on parsing
          }
        }
      }
    } else {
      sessionId = trimmed;
    }
  } else if (Array.isArray(rawValue)) {
    sessionId = rawValue[0] || "";
  } else if (rawValue && typeof rawValue === "object") {
    const obj = rawValue as any;
    sessionId = obj.id || obj.sessionId || obj.value || "";
  }

  // Final cleanup: ensure it's a clean UUID string
  if (sessionId && typeof sessionId === "string") {
    sessionId = sessionId.trim().replace(/^["']|["']$/g, "");
    // If still looks like JSON after cleanup, parse again
    if (sessionId.startsWith("{") || sessionId.startsWith("[")) {
      try {
        const parsed = JSON.parse(sessionId);
        sessionId = parsed.id || parsed.sessionId || parsed.value || "";
      } catch {
        const uuidMatch = sessionId.match(
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
        );
        sessionId = uuidMatch ? uuidMatch[0] : "";
      }
    }
  } else {
    sessionId = "";
  }

  // Debug: log if extraction failed
  if (!sessionId) {
    console.error(
      "Failed to extract sessionId. Raw value:",
      rawValue,
      "Type:",
      typeof rawValue
    );
  }

  // Validate sessionId format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!sessionId || !uuidRegex.test(sessionId)) {
    sessionId = "";
  }

  const [results, setResults] = useState<QuestionResult[]>([]);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>(
    []
  );
  const [masteryImprovements, setMasteryImprovements] = useState<
    TopicMasteryImprovement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Session Summary state
  const [sessionSummary, setSessionSummary] = useState<SessionSummaryResponse | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `${config.apiUrl}/api/practice-sessions/${sessionId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load session summary");
      }

      const data: SessionQuestionsResponse = await response.json();

      // Process results
      const questionResults: QuestionResult[] = data.questions.map(
        (q: SessionQuestion) => {
          const correctAnswer = q.question.correct_answer;
          const correctAnswerArray = Array.isArray(correctAnswer)
            ? correctAnswer
            : [String(correctAnswer)];
          const normalizeArray = (arr: any[]) =>
            arr.map((item) => String(item)).sort();
          const userAnswerNormalized = q.user_answer
            ? normalizeArray(q.user_answer)
            : [];
          const correctAnswerNormalized = normalizeArray(correctAnswerArray);

          const isCorrect =
            q.user_answer && q.status === "answered"
              ? JSON.stringify(userAnswerNormalized) ===
              JSON.stringify(correctAnswerNormalized)
              : false;

          return {
            question_id: q.question.id,
            topic_name: q.topic.name,
            is_correct: isCorrect,
            user_answer: q.user_answer || null,
            correct_answer: q.question.correct_answer || [],
          };
        }
      );

      setResults(questionResults);

      // Calculate topic-wise performance
      const topicMap = new Map<string, { total: number; correct: number }>();

      questionResults.forEach((result) => {
        if (!topicMap.has(result.topic_name)) {
          topicMap.set(result.topic_name, { total: 0, correct: 0 });
        }
        const topic = topicMap.get(result.topic_name)!;
        topic.total += 1;
        if (result.is_correct) topic.correct += 1;
      });

      const topicPerf: TopicPerformance[] = Array.from(topicMap.entries()).map(
        ([name, stats]) => ({
          topic_name: name,
          total: stats.total,
          correct: stats.correct,
          percentage: Math.round((stats.correct / stats.total) * 100),
        })
      );

      setTopicPerformance(topicPerf);

      // Fetch mastery improvements
      try {
        const improvements = await api.getSessionMasteryImprovements(sessionId);
        setMasteryImprovements(improvements);
      } catch (err) {
        console.error("Failed to load mastery improvements:", err);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summary");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Complete session on mount
  useEffect(() => {
    const completeSessionOnMount = async () => {
      try {
        // Ensure sessionId is a valid string UUID
        if (!sessionId || typeof sessionId !== "string") {
          console.error("Invalid sessionId:", sessionId, typeof sessionId);
          return;
        }

        // Double-check it's not an object that got stringified
        if (sessionId.startsWith("{") || sessionId.startsWith("[")) {
          console.error(
            "sessionId appears to be a stringified object:",
            sessionId
          );
          // Try to extract UUID from the stringified object
          try {
            const parsed = JSON.parse(sessionId);
            const extractedId = parsed.id || parsed.sessionId || parsed.value;
            if (extractedId && typeof extractedId === "string") {
              await api.completeSession(extractedId);
              return;
            }
          } catch {
            // Try regex extraction
            const uuidMatch = sessionId.match(
              /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
            );
            if (uuidMatch) {
              await api.completeSession(uuidMatch[0]);
              return;
            }
          }
          console.error("Could not extract valid UUID from:", sessionId);
          return;
        }

        // Final validation and extraction - ensure we have a clean UUID
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // If sessionId doesn't match UUID format, try to extract it
        let finalSessionId = sessionId;
        if (!uuidRegex.test(finalSessionId)) {
          // Try to extract UUID from the string (handles stringified objects)
          const uuidMatch = finalSessionId.match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
          );
          if (uuidMatch) {
            finalSessionId = uuidMatch[0];
          } else {
            console.error(
              "sessionId is not a valid UUID and could not extract one:",
              sessionId
            );
            return;
          }
        }

        // Double-check it's a valid UUID before calling API
        if (!uuidRegex.test(finalSessionId)) {
          console.error("Final sessionId validation failed:", finalSessionId);
          return;
        }

        await api.completeSession(finalSessionId);
      } catch (err) {
        console.error("Failed to complete session:", err);
      }
    };
    completeSessionOnMount();
  }, [sessionId]);

  const generateAllFeedback = async () => {
    setGeneratingFeedback(true);
    try {
      const summary = await api.generateSessionSummary(sessionId);
      setSessionSummary(summary);
    } catch (error) {
      console.error("Failed to generate session summary:", error);
    } finally {
      setGeneratingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">
            Analyzing performance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/dashboard/study-plan")}>
              Back to Study Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalAttempts = masteryImprovements.reduce(
    (sum, imp) => sum + imp.total_attempts,
    0
  );
  const totalCorrect = masteryImprovements.reduce(
    (sum, imp) => sum + imp.correct_attempts,
    0
  );

  const answeredQuestions =
    masteryImprovements.length > 0
      ? totalAttempts
      : results.filter((r) => r.user_answer !== null).length;
  const correctAnswers =
    masteryImprovements.length > 0
      ? totalCorrect
      : results.filter((r) => r.is_correct).length;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const accuracy =
    answeredQuestions > 0
      ? Math.round((correctAnswers / answeredQuestions) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Session Complete
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's a breakdown of your performance
          </p>
        </motion.div>

        {/* Overall Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Accuracy
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {accuracy}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Correct
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {correctAnswers}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Incorrect
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {incorrectAnswers}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topic Performance List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm h-full overflow-hidden">
              {/* Header Section */}
              <div className="p-6 lg:p-8 border-b border-border/40 bg-card/70 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                      Topic Breakdown
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Performance by topic area
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 lg:p-8 bg-muted/20">
                <div className="space-y-6">
                  {(masteryImprovements.length > 0
                    ? masteryImprovements
                    : topicPerformance
                  ).map((item: any, i) => {
                    const name = item.topic_name;
                    const correct = item.correct_attempts ?? item.correct;
                    const total = item.total_attempts ?? item.total;
                    const acc =
                      total > 0 ? Math.round((correct / total) * 100) : 0;

                    return (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-border/40 bg-card/50 hover:bg-card/70 hover:border-primary/30 transition-all duration-200 ease-in-out"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-foreground text-base">
                            {name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground tabular-nums">
                              {correct}/{total}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`
                                font-mono font-semibold text-xs px-2 py-0.5
                                ${acc >= 70
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                  : acc >= 50
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                }
                              `}
                            >
                              {acc}%
                            </Badge>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden border border-border/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${acc}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`
                              h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden
                              ${acc >= 70
                                ? "bg-green-500"
                                : acc >= 50
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }
                            `}
                          >
                            {/* Shimmer effect */}
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              style={{
                                backgroundSize: "200% 100%",
                                animation: "shimmer 2s ease-in-out infinite",
                              }}
                            />
                            {/* Glow effect */}
                            <div
                              className={`
                                absolute top-0 right-0 w-8 h-full blur-md transition-all duration-700
                                ${acc >= 70
                                  ? "bg-green-500/60"
                                  : acc >= 50
                                    ? "bg-amber-500/60"
                                    : "bg-red-500/60"
                                }
                              `}
                            />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights Section - Billion Dollar Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group"
        >
          <Card className="border border-border rounded-3xl bg-card shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
            {/* Header Section with Glassmorphism */}
            <div className="relative p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />

              <div className="relative flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/10">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    AI Insights
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Holistic session analysis powered by AI
                  </p>
                </div>
              </div>

              <Button
                onClick={generateAllFeedback}
                disabled={generatingFeedback || sessionSummary !== null}
                className={`
                  relative h-12 px-8 font-semibold text-base rounded-xl transition-all duration-300 shadow-lg
                  ${generatingFeedback || sessionSummary !== null
                    ? "cursor-not-allowed opacity-60"
                    : "hover:scale-[1.02] hover:shadow-xl"
                  }
                `}
                style={{
                  backgroundColor: sessionSummary !== null ? "#22c55e" : "#866ffe",
                  color: "white",
                }}
              >
                {/* Animated shimmer effect */}
                {!sessionSummary && !generatingFeedback && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s ease-in-out infinite",
                    }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {generatingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>Analyzing Session...</span>
                    </>
                  ) : sessionSummary !== null ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Insights Ready</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Insights</span>
                    </>
                  )}
                </span>
              </Button>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {sessionSummary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Overall Assessment - Premium Card */}
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border shadow-sm overflow-hidden">
                    {/* Decorative gradient orb */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Overall Assessment</h3>
                      </div>
                      <p className="text-foreground leading-relaxed text-lg">
                        {sessionSummary.summary.overall_assessment}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 overflow-hidden group/card hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-500/20 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-500" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground">Strengths</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sessionSummary.summary.strengths.length > 0 ? (
                            sessionSummary.summary.strengths.map((s, i) => (
                              <Badge
                                key={i}
                                className="px-3 py-1.5 bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30 font-medium hover:bg-green-500/25 transition-colors cursor-default"
                              >
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Keep practicing to identify your strengths!</span>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 overflow-hidden group/card hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover/card:scale-150 transition-transform duration-500" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground">Areas to Improve</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sessionSummary.summary.weaknesses.length > 0 ? (
                            sessionSummary.summary.weaknesses.map((w, i) => (
                              <Badge
                                key={i}
                                className="px-3 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium hover:bg-amber-500/25 transition-colors cursor-default"
                              >
                                {w}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Great job - no major weaknesses identified!</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Speed Analysis */}
                  {sessionSummary.summary.speed_analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 overflow-hidden group/card hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    >
                      <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl group-hover/card:scale-125 transition-transform duration-500" />
                      <div className="relative flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-2">Speed Analysis</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {sessionSummary.summary.speed_analysis}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Patterns */}
                  {sessionSummary.summary.error_patterns.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 overflow-hidden"
                    >
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-rose-500" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground">Patterns to Watch</h3>
                        </div>
                        <ul className="space-y-3">
                          {sessionSummary.summary.error_patterns.map((pattern, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                              <span className="text-foreground">{pattern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {/* Improvement Tips - Premium Design */}
                  {sessionSummary.summary.improvement_tips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 overflow-hidden"
                    >
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground">Tips for Improvement</h3>
                        </div>
                        <div className="space-y-3">
                          {sessionSummary.summary.improvement_tips.map((tip, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-300"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                                {i + 1}
                              </div>
                              <p className="text-foreground leading-relaxed pt-1">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Empty State - Premium Design */
                <div className="text-center py-16 lg:py-20">
                  <div className="relative inline-block">
                    {/* Animated gradient ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-3xl blur-xl opacity-30 animate-pulse" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/20">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-8 mb-3">
                    Unlock AI-Powered Insights
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-lg mb-8">
                    Get a comprehensive analysis of your session including strengths,
                    areas to improve, pacing insights, and personalized tips.
                  </p>
                  <Button
                    onClick={generateAllFeedback}
                    disabled={generatingFeedback}
                    className="h-12 px-8 font-semibold text-base rounded-xl shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
                    style={{ backgroundColor: "#866ffe", color: "white" }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Insights Now
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-8"
        >
          <Button
            variant="outline"
            onClick={() => router.push(`/practice/${sessionId}`)}
            className="h-10 px-6 border-border/60 bg-background/50 hover:bg-accent hover:border-primary/30 transition-all text-base font-semibold min-w-[200px] shadow-sm hover:shadow-md"
          >
            Review Questions
          </Button>
          <Button
            onClick={() => router.push("/dashboard/study-plan")}
            className="h-10 px-6 font-semibold transition-all shadow-sm text-white hover:opacity-90 text-base min-w-[200px] flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#866ffe",
            }}
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <ProtectedRoute>
      <SummaryContent />
    </ProtectedRoute>
  );
}
