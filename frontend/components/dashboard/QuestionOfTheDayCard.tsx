"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { QuestionPracticePopup } from "@/components/revision/QuestionPracticePopup";
import type { SessionQuestion } from "@/lib/types";

export default function QuestionOfTheDayCard() {
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] =
    useState<SessionQuestion | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [todayKey, setTodayKey] = useState<string>("");

  // Helper function to get today's date key
  const getTodayKey = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Check for date changes and reset completion if needed
  useEffect(() => {
    const checkDateChange = () => {
      const currentDateKey = getTodayKey();
      if (todayKey && todayKey !== currentDateKey) {
        // Date has changed, reset completion
        setIsCompleted(false);
      }
      setTodayKey(currentDateKey);
    };

    // Check immediately
    checkDateChange();

    // Set up interval to check every minute (in case user keeps page open overnight)
    const interval = setInterval(checkDateChange, 60000);

    // Also check when window regains focus (user comes back to tab)
    const handleFocus = () => {
      checkDateChange();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [todayKey]);

  useEffect(() => {
    const fetchQuestionOfTheDay = async () => {
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("id, stem, difficulty, topics(id, name)")
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          const today = new Date();
          const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const randomIndex = dayOfYear % data.length;
          const selectedQuestion = data[randomIndex];
          setQuestion(selectedQuestion);

          // Check if today's question has been completed
          const currentDateKey = getTodayKey();
          setTodayKey(currentDateKey);
          const completionKey = `qotd-completed-${selectedQuestion.id}-${currentDateKey}`;
          const completed = localStorage.getItem(completionKey) === "true";
          setIsCompleted(completed);
        }
      } catch (error) {
        console.error("Error fetching question of the day:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionOfTheDay();
  }, []);

  const stripHtml = (html?: string | null) => {
    if (!html) return "Question text unavailable";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const transformToSessionQuestion = (q: any): SessionQuestion | null => {
    if (!q || !q.topics) {
      return null;
    }
    return {
      session_question_id: `qotd-${q.id}`,
      question: q as any,
      topic: {
        id: q.topics.id,
        name: q.topics.name,
        category_id: "",
        weight_in_category: 0,
      } as any,
      status: "not_started",
      display_order: 0,
      user_answer: null,
      is_saved: false,
    } as SessionQuestion;
  };

  const handleQuestionClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!question) return;

    try {
      const { data: fullQuestion, error } = await supabase
        .from("questions")
        .select(
          "id, stem, question_type, answer_options, correct_answer, difficulty, topics(id, name)"
        )
        .eq("id", question.id)
        .single();

      if (error) throw error;

      const sessionQuestion = transformToSessionQuestion(fullQuestion);
      if (sessionQuestion) {
        setSelectedQuestion(sessionQuestion);
        setIsPopupOpen(true);
      }
    } catch (error) {
      console.error("Error loading question:", error);
    }
  };

  return (
    <>
      <button
        type="button"
        className="flex h-full w-full flex-col rounded-xl border border-border bg-card p-6 text-left hover:bg-muted/40"
        onClick={handleQuestionClick}
      >
        <div className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-schedule">
              Question of the day
            </h2>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-sm text-progress">
                <CheckCircle2 className="h-4 w-4" />
                Done
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col flex-1 justify-between">
              <div className="flex-1 flex flex-col">
                <p className="text-base text-foreground leading-relaxed mb-4">
                  Practice a new question every day to build consistency and
                  improve your SAT skills.
                </p>
                <div className="mt-auto text-sm text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin" />
                </div>
              </div>
              <div className="mt-6 flex justify-end text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          ) : question ? (
            <div className="flex flex-col flex-1 justify-between">
              <div className="flex-1 flex flex-col">
                <p className="text-base text-foreground leading-relaxed mb-4">
                  Practice a new question every day to build consistency and
                  improve your SAT skills.
                </p>
                <div className="mt-auto flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {question.topics?.name && <span>{question.topics.name}</span>}
                  {question.difficulty && (
                    <span>
                      {question.difficulty === "E"
                        ? "Easy"
                        : question.difficulty === "M"
                        ? "Medium"
                        : "Hard"}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-1 text-sm font-medium text-primary">
                Practice
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-sm text-muted-foreground">
                No question available
              </div>
            </div>
          )}
        </div>
      </button>

      {selectedQuestion && (
        <QuestionPracticePopup
          open={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          question={selectedQuestion}
          onComplete={() => {
            // Mark question as completed
            if (question) {
              const currentDateKey = getTodayKey();
              const completionKey = `qotd-completed-${question.id}-${currentDateKey}`;
              localStorage.setItem(completionKey, "true");
              setIsCompleted(true);
            }
            setIsPopupOpen(false);
            setSelectedQuestion(null);
          }}
        />
      )}
    </>
  );
}
