"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/ui/page-loader";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import { AlertCircle, CheckCircle2, XCircle, TrendingUp, Trophy, Target, BrainCircuit } from "lucide-react";
import { components } from "@/lib/types/api.generated";

type DiagnosticResults =
  components["schemas"]["DiagnosticTestResultsResponse"];

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = params.testId as string;
  const returnToOnboarding = searchParams.get('returnToOnboarding') === 'true';

  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Not authenticated");

        const response = await fetch(
          `${config.apiUrl}/api/diagnostic-test/${testId}/results`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to load results");

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load results"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [testId]);

  if (isLoading) {
    return <PageLoader message="Analyzing performance..." />;
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-card border border-border p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">Unable to Load Results</h2>
          <p className="text-muted-foreground mb-6">{error || "Results could not be found."}</p>
          <Button
            onClick={() => router.push("/dashboard")}
            size="lg"
            variant="default"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const {
    test,
    total_correct,
    total_questions,
    overall_percentage,
    math_correct,
    math_total,
    math_percentage,
    rw_correct,
    rw_total,
    rw_percentage,
    topic_mastery_initialized,
  } = results;

  // Sort topics by mastery (weakest first)
  const sortedTopics = [...topic_mastery_initialized].sort(
    (a, b) => a.initial_mastery - b.initial_mastery
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Diagnostic Results
          </h1>
          <p className="text-lg text-muted-foreground">
            Completed on{" "}
            {test.completed_at
              ? new Date(test.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : "N/A"}
          </p>
        </div>

        {/* Success Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 animate-in fade-in zoom-in-95 duration-500 delay-100">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <Trophy className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Baseline Established
            </h3>
            <p className="text-emerald-600/80 dark:text-emerald-400/80 max-w-3xl leading-relaxed">
              We've analyzed your performance to create your initial mastery profile. 
              Your personalized study plan has been calibrated to target your specific needs.
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="bg-card hover:bg-accent/5 transition-colors border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-24 h-24 text-primary" />
             </div>
             <div className="relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Overall Score</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-foreground">{total_correct}</span>
                  <span className="text-xl text-muted-foreground">/{total_questions}</span>
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                   {overall_percentage.toFixed(1)}% Accuracy
                </div>
             </div>
          </div>

          {/* Math Score */}
          <div className="bg-card hover:bg-accent/5 transition-colors border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-blue-500" />
             </div>
             <div className="relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Math</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{math_correct}</span>
                  <span className="text-xl text-muted-foreground">/{math_total}</span>
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                   {math_percentage.toFixed(1)}% Accuracy
                </div>
             </div>
          </div>

          {/* RW Score */}
          <div className="bg-card hover:bg-accent/5 transition-colors border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-24 h-24 text-green-500" />
             </div>
             <div className="relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Reading & Writing</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-green-600 dark:text-green-400">{rw_correct}</span>
                  <span className="text-xl text-muted-foreground">/{rw_total}</span>
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                   {rw_percentage.toFixed(1)}% Accuracy
                </div>
             </div>
          </div>
        </div>

        {/* Mastery Breakdown */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-violet-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Initial Mastery Profile</h2>
              <p className="text-muted-foreground">Breakdown by topic strength.</p>
            </div>
          </div>

          <div className="grid gap-6">
            {sortedTopics.map((topic, index) => {
              const percentage = topic.initial_mastery * 100;
              
              // Dynamic colors based on performance
              let colorClass = "bg-rose-500";
              let textColorClass = "text-rose-600 dark:text-rose-400";
              let bgClass = "bg-rose-500/10";
              
              if (percentage >= 80) {
                colorClass = "bg-emerald-500";
                textColorClass = "text-emerald-600 dark:text-emerald-400";
                bgClass = "bg-emerald-500/10";
              } else if (percentage >= 60) {
                colorClass = "bg-blue-500";
                textColorClass = "text-blue-600 dark:text-blue-400";
                bgClass = "bg-blue-500/10";
              } else if (percentage >= 40) {
                colorClass = "bg-amber-500";
                textColorClass = "text-amber-600 dark:text-amber-400";
                bgClass = "bg-amber-500/10";
              }

              return (
                <div key={topic.topic_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-base">
                      {topic.topic_name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground hidden sm:inline-block">
                        {topic.correct_answers}/{topic.questions_answered} correct
                      </span>
                      <span className={`font-bold ${textColorClass} min-w-[3rem] text-right`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClass} transition-all duration-1000 ease-out rounded-full`}
                      style={{ 
                        width: `${percentage}%`,
                        transitionDelay: `${index * 100}ms` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-card border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
          <div className="space-y-2 text-center md:text-left">
             <h2 className="text-2xl font-bold text-foreground">Ready to Start Improving?</h2>
             <p className="text-muted-foreground max-w-lg">
               Your diagnostic results have been saved. Continue to generate your personalized study plan based on these insights.
             </p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
             <Button
               onClick={() => router.push("/dashboard")}
               variant="outline"
               size="lg"
               className="h-12 px-6"
             >
               Dashboard
             </Button>
             <Button
               onClick={() => {
                 if (returnToOnboarding) {
                   router.push('/onboard?returnFromDiagnostic=true');
                 } else {
                   router.push('/onboard');
                 }
               }}
               size="lg"
               className="h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
             >
               {returnToOnboarding ? 'Continue Onboarding' : 'Create Study Plan'}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticTestResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
