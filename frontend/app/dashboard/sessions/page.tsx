"use client";

import { useMemo } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRecentDrills } from "@/hooks/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { History, RotateCcw, Trophy } from "lucide-react";
import {
  SessionHistoryItem,
  type DrillSession,
} from "@/components/my-sat/SpecialPractice";
import { buildPracticeSessionPath } from "@/lib/practice-navigation";
import { useRouter } from "next/navigation";

function SessionsContent() {
  const router = useRouter();
  const {
    data: recentDrills = [],
    isLoading: isLoadingDrills,
    error,
  } = useRecentDrills(50);

  const inProgressSessions = useMemo(
    () =>
      recentDrills.filter(
        (session: DrillSession) =>
          session.status === "in_progress" ||
          (session.answered_count > 0 && session.status !== "completed")
      ),
    [recentDrills]
  );

  const pastSessions = useMemo(
    () =>
      recentDrills.filter(
        (session: DrillSession) => session.status === "completed"
      ),
    [recentDrills]
  );

  const handleNavigateSession = (sessionId: string) => {
    router.push(buildPracticeSessionPath(sessionId, "/dashboard/sessions"));
  };

  if (isLoadingDrills) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-[480px] w-full rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-destructive/20 bg-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-2xl mb-6">
              <History className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Couldn&apos;t Load Session History
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading your sessions."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <History className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Session History
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sessions
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              See the same session history from Special Practice, with active
              work at the top and completed sessions saved below.
            </p>
          </div>
        </div>

        {recentDrills.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
              <History className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No Session History Yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create a Special Practice session and it will appear here once you
              start working through it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      In Progress
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Sessions you can resume right now
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {inProgressSessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                    No sessions in progress
                  </div>
                ) : (
                  inProgressSessions.map((session: DrillSession) => (
                    <SessionHistoryItem
                      key={session.id}
                      session={session}
                      onNavigate={handleNavigateSession}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Past Sessions
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Completed session history
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {pastSessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                    No past sessions yet
                  </div>
                ) : (
                  pastSessions.map((session: DrillSession) => (
                    <SessionHistoryItem
                      key={session.id}
                      session={session}
                      onNavigate={handleNavigateSession}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <SessionsContent />
    </ProtectedRoute>
  );
}
