"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  topic_name: string;
  description?: string;
  scheduled_date: string;
  duration_minutes: number;
  status: string;
  num_questions: number;
}

interface MissionCardProps {
  session?: Session;
  isLoading?: boolean;
  hasPlan?: boolean;
  onStart?: () => void;
}

export default function MissionCard({
  session,
  isLoading,
  hasPlan = false,
  onStart,
}: MissionCardProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
    );
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          {hasPlan ? "Sessions finished" : "No study plan yet"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {hasPlan
            ? "Every scheduled session is done. Make a new plan, or keep practicing from Drill."
            : "Set a test date and Prep St will build the sessions."}
        </p>
        <Button className="mt-6" onClick={() => router.push("/onboard")}>
          {hasPlan ? "Create a new plan" : "Create a study plan"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between gap-6 rounded-xl border border-border bg-card p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {session.duration_minutes} min · {session.num_questions} questions
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          {session.topic_name}
        </h3>
        {session.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {session.description}
          </p>
        )}
      </div>
      <Button onClick={onStart} className="w-full sm:w-fit">
        <Play className="h-4 w-4" />
        Start session
      </Button>
    </div>
  );
}
