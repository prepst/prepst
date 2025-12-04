"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  ChevronDown
} from "lucide-react";
import {
  QuestionResult,
  TopicPerformance,
  SessionQuestion,
  SessionQuestionsResponse,
  AIFeedbackContent,
  TopicMasteryImprovement,
} from "@/lib/types";
import { api } from "@/lib/api";
import { AIFeedbackDisplay } from "@/components/practice/AIFeedbackDisplay";
import { TopicMasteryRadialChart } from "@/components/charts/TopicMasteryRadialChart";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SummaryContent() {
  const params = useParams();
  const router = useRouter();
  
  // Extract sessionId with proper handling
  let sessionId = "";
  const rawValue = params.sessionId;
  
  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    // Check if it's a JSON string
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        sessionId = parsed.id || parsed.sessionId || parsed.value || "";
      } catch {
        // If JSON parsing fails, extract UUID with regex
        const uuidMatch = trimmed.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        sessionId = uuidMatch ? uuidMatch[0] : "";
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
        const uuidMatch = sessionId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
        sessionId = uuidMatch ? uuidMatch[0] : "";
      }
    }
  } else {
    sessionId = "";
  }
  
  // Debug: log if extraction failed
  if (!sessionId) {
    console.error("Failed to extract sessionId. Raw value:", rawValue, "Type:", typeof rawValue);
  }

  // Validate sessionId format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!sessionId || !uuidRegex.test(sessionId)) {
    sessionId = "";
  }

  const [results, setResults] = useState<QuestionResult[]>([]);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [masteryImprovements, setMasteryImprovements] = useState<TopicMasteryImprovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Feedback state
  const [sessionFeedback, setSessionFeedback] = useState<Map<string, AIFeedbackContent>>(new Map());
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
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
          const correctAnswerArray = Array.isArray(correctAnswer) ? correctAnswer : [String(correctAnswer)];
          const normalizeArray = (arr: any[]) => arr.map((item) => String(item)).sort();
          const userAnswerNormalized = q.user_answer ? normalizeArray(q.user_answer) : [];
          const correctAnswerNormalized = normalizeArray(correctAnswerArray);

          const isCorrect = q.user_answer && q.status === "answered"
              ? JSON.stringify(userAnswerNormalized) === JSON.stringify(correctAnswerNormalized)
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
          console.error("sessionId appears to be a stringified object:", sessionId);
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
            const uuidMatch = sessionId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
              await api.completeSession(uuidMatch[0]);
              return;
            }
          }
          console.error("Could not extract valid UUID from:", sessionId);
          return;
        }
        
        // Final validation and extraction - ensure we have a clean UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        // If sessionId doesn't match UUID format, try to extract it
        let finalSessionId = sessionId;
        if (!uuidRegex.test(finalSessionId)) {
          // Try to extract UUID from the string (handles stringified objects)
          const uuidMatch = finalSessionId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
          if (uuidMatch) {
            finalSessionId = uuidMatch[0];
          } else {
            console.error("sessionId is not a valid UUID and could not extract one:", sessionId);
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
      const feedbackList = await api.generateSessionFeedback(sessionId);
      const feedbackMap = new Map(
        feedbackList.map((f) => [f.question_id, f.feedback])
      );
      setSessionFeedback(feedbackMap);
    } catch (error) {
      console.error("Failed to generate feedback:", error);
    } finally {
      setGeneratingFeedback(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Analyzing performance...</p>
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
  const totalAttempts = masteryImprovements.reduce((sum, imp) => sum + imp.total_attempts, 0);
  const totalCorrect = masteryImprovements.reduce((sum, imp) => sum + imp.correct_attempts, 0);

  const answeredQuestions = masteryImprovements.length > 0
      ? totalAttempts
      : results.filter((r) => r.user_answer !== null).length;
  const correctAnswers = masteryImprovements.length > 0
      ? totalCorrect
      : results.filter((r) => r.is_correct).length;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const accuracy = answeredQuestions > 0
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
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Session Complete</h1>
          <p className="text-muted-foreground text-lg">Here's a breakdown of your performance</p>
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
                <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correct</p>
                <p className="text-3xl font-bold text-foreground">{correctAnswers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incorrect</p>
                <p className="text-3xl font-bold text-foreground">{incorrectAnswers}</p>
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
            <Card className="border-border/50 bg-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Topic Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(masteryImprovements.length > 0 ? masteryImprovements : topicPerformance).map((item: any, i) => {
                  const name = item.topic_name;
                  const correct = item.correct_attempts ?? item.correct;
                  const total = item.total_attempts ?? item.total;
                  const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
                  
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{name}</span>
                        <span className="text-muted-foreground">{correct}/{total} Correct</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${acc}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            acc >= 70 ? "bg-green-500" : acc >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  AI Insights
                </h2>
                <p className="text-muted-foreground">Get personalized feedback on your answers</p>
              </div>
              <Button
                onClick={generateAllFeedback}
                disabled={generatingFeedback || sessionFeedback.size > 0}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
              >
                {generatingFeedback ? "Analyzing..." : sessionFeedback.size > 0 ? "Feedback Ready" : "Generate Feedback"}
              </Button>
            </div>

            <div className="p-6 bg-muted/30">
              {sessionFeedback.size > 0 ? (
                <div className="space-y-4">
                  {results.map((result, index) => {
                    const feedback = sessionFeedback.get(result.question_id);
                    if (!feedback) return null;
                    const isExpanded = expandedQuestion === result.question_id;

                    return (
                      <div 
                        key={result.question_id}
                        className={`border rounded-xl overflow-hidden transition-all duration-200 bg-card ${
                          isExpanded ? 'ring-2 ring-primary/20 border-primary/50' : 'border-border hover:border-border/80'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedQuestion(isExpanded ? null : result.question_id)}
                          className="w-full p-4 flex items-center justify-between gap-4 text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              result.is_correct ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {result.is_correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Question {index + 1}</p>
                              <p className="text-sm text-muted-foreground">{result.topic_name}</p>
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-border/50"
                            >
                              <div className="p-4">
                                <AIFeedbackDisplay feedback={feedback} isCorrect={result.is_correct} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-muted-foreground">
                    Tap "Generate Feedback" to unlock deep insights into your performance.
                  </p>
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
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/practice/${sessionId}`)}
            className="min-w-[200px]"
          >
            Review Questions
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/dashboard/study-plan")}
            className="min-w-[200px]"
          >
            Return to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
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
