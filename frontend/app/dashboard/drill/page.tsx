"use client";

import { useEffect, useState } from "react";
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
import { useCompletedSessions } from "@/hooks/queries";
import { formatDistanceToNow } from "date-fns";

export default function DrillPage() {
  const [heatmap, setHeatmap] = useState<Record<string, CategoryHeatmap>>({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] =
    useState<CategoriesAndTopicsResponse | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  // Fetch recent drill sessions
  const { data: completedSessions, isLoading: loadingSessions } = useCompletedSessions(5);

  const handleStartDrill = () => {
    // TODO: wire to backend create drill session
    console.log("Starting drill with topics:", selectedTopics);
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
          ? categories.math.map((category: any) => ({
              id: category.id,
              name: category.name,
              difficulty: "Medium",
              lastReviewed: "Never",
              masteryLevel: 0,
              questionsCount: category.topics?.length || 0,
              section: "math",
            }))
          : []),
        ...(Array.isArray(categories.reading_writing)
          ? categories.reading_writing.map((category: any) => ({
              id: category.id,
              name: category.name,
              difficulty: "Medium",
              lastReviewed: "Never",
              masteryLevel: 0,
              questionsCount: category.topics?.length || 0,
              section: "reading_writing",
            }))
          : []),
      ]
    : [];

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  return (
    <div className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-7xl px-4 py-8 space-y-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Drill Session
                </h1>
                <p className="text-muted-foreground">
                  Targeted drills by skill mastery
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-72" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-8">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <Skeleton key={j} className="h-40 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            Object.keys(heatmap).length > 0 && (
              <div className="mb-12">
                <div className="bg-card border border-border rounded-2xl p-8">
                  <div>
                    <CardTitle>Select Topics for Drills</CardTitle>
                    <CardDescription>
                      Choose specific topics to drill on.
                    </CardDescription>
                  </div>
                  <br></br>
                  <div className="space-y-6">
                    {Object.entries(heatmap).map(([categoryName, category]) => (
                      <div key={categoryName}>
                        <h3 className="text-lg font-semibold text-foreground mb-3">
                          {categoryName}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({category.section})
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                          {category.skills.map((skill) => (
                            <SkillRadialChart
                              key={skill.skill_id}
                              skillName={skill.skill_name}
                              mastery={skill.mastery}
                              correctAttempts={skill.correct_attempts}
                              totalAttempts={skill.total_attempts}
                              velocity={skill.velocity}
                              plateau={skill.plateau}
                              skillId={skill.skill_id}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Topics Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Select Categories for Drills</CardTitle>
                  <CardDescription>
                    Choose categories to target in your drill session.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleStartDrill}
                  disabled={selectedTopics.length === 0}
                  className="px-6"
                >
                  Drill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-48 mb-3" />
                        <Skeleton className="h-2 w-full mb-2" />
                        <Skeleton className="h-2 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {revisionTopics.map((topic) => (
                    <Card
                      key={topic.id}
                      className={`cursor-pointer transition-all duration-200 border ${
                        selectedTopics.includes(topic.id)
                          ? "ring-2 ring-primary bg-primary/5 border-primary"
                          : "hover:shadow-md border-border bg-card"
                      }`}
                      onClick={() => handleTopicToggle(topic.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-card-foreground">
                            {topic.name}
                          </h3>
                          <div className="flex gap-2">
                            <Badge
                              className={
                                topic.section === "math"
                                  ? "bg-[#FAC710] text-black hover:bg-[#FAC710]/90"
                                  : "bg-[#FD87DC] text-black hover:bg-[#FD87DC]/90"
                              }
                            >
                              {topic.section === "math"
                                ? "Math"
                                : "Reading/Writing"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Topics Available</span>
                            <span className="font-medium">
                              {topic.questionsCount}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                topic.section === "math"
                                  ? "bg-[#FAC710]"
                                  : "bg-[#FD87DC]"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (topic.questionsCount / 10) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Drill Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Drill Sessions</CardTitle>
              <CardDescription>
                Your recent drill activity and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg bg-card/50">
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="h-6 w-12 ml-auto" />
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !completedSessions || completedSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No completed drill sessions yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="mt-2"
                  >
                    Start your first drill above
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
                      <div>
                        <h4 className="font-medium text-card-foreground">
                          {session.session_type === 'drill' ? 'Targeted Drill' : 
                           session.session_type === 'revision' ? 'Revision Session' : 'Practice Session'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })} • {session.total_questions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          (session.correct_count / session.total_questions) >= 0.8 ? 'text-green-600 dark:text-green-400' :
                          (session.correct_count / session.total_questions) >= 0.6 ? 'text-blue-600 dark:text-blue-400' :
                          'text-orange-600 dark:text-orange-400'
                        }`}>
                          {Math.round((session.correct_count / session.total_questions) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}