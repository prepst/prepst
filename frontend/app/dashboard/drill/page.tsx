"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CategoryHeatmap, CategoriesAndTopicsResponse } from "@/lib/types";
import { SkillRadialChart } from "@/components/charts/SkillRadialChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompletedSessions } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function DrillPage() {
  const router = useRouter();
  const [heatmap, setHeatmap] = useState<Record<string, CategoryHeatmap>>({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] =
    useState<CategoriesAndTopicsResponse | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Fetch recent drill sessions
  const { data: completedSessions, isLoading: loadingSessions } =
    useCompletedSessions(5);

  const handleStartDrill = async () => {
    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    if (selectedTopics.length > 5) {
      toast.error("Maximum 5 topics allowed");
      return;
    }

    try {
      setIsCreatingSession(true);
      const drillSession = await api.createDrillSession(selectedTopics, 3);
      toast.success(`Drill session created with ${drillSession.num_questions} questions`);
      router.push(`/practice/${drillSession.session_id}`);
    } catch (error) {
      console.error("Failed to create drill session:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create drill session";
      toast.error(errorMessage);
    } finally {
      setIsCreatingSession(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setLoadingCategories(true);
        const [response, categoriesData] = await Promise.all([
          api.getSkillHeatmap(),
          api.getCategoriesAndTopics(),
        ]);
        setHeatmap(response.heatmap);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load skill heatmap:", err);
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };
    load();
  }, []);

  const revisionTopics = categories
    ? [
        ...(Array.isArray(categories.math)
          ? categories.math.flatMap((category: any) =>
              (category.topics || []).map((topic: any) => ({
                id: topic.id,
                name: topic.name,
                categoryName: category.name,
                section: "math",
                questionsCount: 3, // 3 questions per topic
              }))
            )
          : []),
        ...(Array.isArray(categories.reading_writing)
          ? categories.reading_writing.flatMap((category: any) =>
              (category.topics || []).map((topic: any) => ({
                id: topic.id,
                name: topic.name,
                categoryName: category.name,
                section: "reading_writing",
                questionsCount: 3, // 3 questions per topic
              }))
            )
          : []),
      ]
    : [];

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      } else {
        if (prev.length >= 5) {
          toast.error("Maximum 5 topics allowed");
          return prev;
        }
        return [...prev, topicId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
                Drill Session
              </h1>
              <p className="text-lg text-muted-foreground">
                Master specific skills with targeted practice sets
              </p>
            </div>
            <Button
              onClick={handleStartDrill}
              disabled={selectedTopics.length === 0 || isCreatingSession}
              size="lg"
              className="bg-[#866ffe] hover:bg-[#7a5ffe] text-white font-semibold shadow-lg shadow-primary/25 h-12 px-8 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isCreatingSession ? "Creating..." : "Start Practice Drill"}
            </Button>
          </div>

          {/* Topics Selection */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Select Topics
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedTopics.length} selected (max 5)
              </p>
            </div>

            {loadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {revisionTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`
                      relative group cursor-pointer p-5 rounded-xl border-2 transition-all duration-200 ease-out
                      ${
                        selectedTopics.includes(topic.id)
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                      }
                    `}
                    onClick={() => handleTopicToggle(topic.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-8">
                        <h3 className="font-semibold text-foreground leading-tight">
                          {topic.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {topic.categoryName}
                        </p>
                      </div>
                      <Checkbox
                        checked={selectedTopics.includes(topic.id)}
                        onCheckedChange={() => handleTopicToggle(topic.id)}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className={`
                        h-1.5 flex-1 rounded-full overflow-hidden bg-muted
                      `}
                      >
                        <div
                          className={`h-full rounded-full ${
                            topic.section === "math"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (topic.questionsCount / 10) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {topic.questionsCount} Qs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {loading ? (
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm"
                >
                  <Skeleton className="h-8 w-48 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="aspect-square rounded-2xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            Object.keys(heatmap).length > 0 && (
              <div className="space-y-8">
                {Object.entries(heatmap).map(([categoryName, category]) => (
                  <div key={categoryName} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {categoryName}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-muted-foreground bg-muted font-medium"
                      >
                        {category.section === "math"
                          ? "Math"
                          : "Reading & Writing"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.skills.map((skill) => (
                        <div
                          key={skill.skill_id}
                          className="bg-card rounded-2xl p-1 border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <SkillRadialChart
                            skillName={skill.skill_name}
                            mastery={skill.mastery}
                            correctAttempts={skill.correct_attempts}
                            totalAttempts={skill.total_attempts}
                            velocity={skill.velocity}
                            plateau={skill.plateau}
                            skillId={skill.skill_id}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Recent Drill Sessions */}
          <section className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">
                Recent Activity
              </h2>
              <p className="text-muted-foreground">
                Your latest practice performance
              </p>
            </div>

            <div className="divide-y divide-border">
              {loadingSessions ? (
                <div className="p-8 space-y-4">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : !completedSessions || completedSessions.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p>No completed drill sessions yet.</p>
                </div>
              ) : (
                completedSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {session.session_type === "drill"
                          ? "Targeted Drill"
                          : session.session_type === "revision"
                          ? "Revision Session"
                          : "Practice Session"}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>
                          {formatDistanceToNow(new Date(session.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                        <span>{session.total_questions} questions</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          session.correct_count / session.total_questions >= 0.8
                            ? "text-green-600 dark:text-green-400"
                            : session.correct_count / session.total_questions >=
                              0.6
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {Math.round(
                          (session.correct_count / session.total_questions) *
                            100
                        )}
                        %
                      </div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Accuracy
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
