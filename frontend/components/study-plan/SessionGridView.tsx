"use client";

import { TodoSection as TodoSectionType, TodoSession } from "./types";
import { TodoSection } from "./todo-section";
import { getSessionStatus } from "@/lib/utils/session-utils";

interface SessionGridViewProps {
  sessions: TodoSession[];
  mockExams?: TodoSession[];
  onToggleTodo: (todoId: string) => void;
}

// Helper function to sort sessions within a section
function sortSessionsInSection(sessions: TodoSession[]): TodoSession[] {
  return [...sessions].sort((a, b) => {
    const statusA = getSessionStatus(a);
    const statusB = getSessionStatus(b);

    // Priority order: overdue > in-progress > upcoming > completed
    const priorityMap: Record<string, number> = {
      overdue: 0,
      "in-progress": 1,
      upcoming: 2,
      completed: 3,
    };

    const priorityDiff = priorityMap[statusA] - priorityMap[statusB];
    if (priorityDiff !== 0) return priorityDiff;

    // Within same status, sort by date
    const dateA = new Date(a.scheduled_date || 0).getTime();
    const dateB = new Date(b.scheduled_date || 0).getTime();
    return dateA - dateB;
  });
}

// Helper function to categorize sessions into sections
function categorizeSessions(
  sessions: TodoSession[],
  mockExams: TodoSession[] = []
): TodoSectionType[] {
  // Sort all sessions by priority
  const sortedSessions = sortSessionsInSection(sessions);

  // Split sessions into two halves
  const totalSessions = sortedSessions.length;
  const firstHalfCount = Math.ceil(totalSessions / 2);

  const thisWeekSessions = sortedSessions.slice(0, firstHalfCount);
  const nextWeekSessions = sortedSessions.slice(firstHalfCount);

  // Process mock exams
  const hasRealMockExams = mockExams.length > 0;
  const mockTodos = hasRealMockExams
    ? mockExams
    : [
        {
          id: "mock-test",
          study_plan_id: sessions[0]?.study_plan_id || "",
          scheduled_date: new Date().toISOString(),
          session_number: 0,
          status: "upcoming" as const,
          started_at: null,
          completed_at: null,
          created_at: null,
          updated_at: null,
          topics: [],
          total_questions: 98,
          completed_questions: 0,
          examType: "mock-exam" as const,
        },
      ];

  return [
    {
      id: "this-week",
      title: "This Week Batch",
      icon: "📅",
      todos: thisWeekSessions,
    },
    {
      id: "mock-1",
      title: "Mock Test",
      icon: "🎯",
      todos: mockTodos,
    },
    {
      id: "next-week",
      title: "Next Week Batch",
      icon: "📆",
      todos: nextWeekSessions,
    },
    {
      id: "mock-2",
      title: "Mock Test",
      icon: "🎯",
      todos: [
        {
          id: "mock-test-2",
          study_plan_id: sessions[0]?.study_plan_id || "",
          scheduled_date: new Date().toISOString(),
          session_number: 0,
          status: "upcoming" as const,
          started_at: null,
          completed_at: null,
          created_at: null,
          updated_at: null,
          topics: [],
          total_questions: 98,
          completed_questions: 0,
          examType: "mock-exam" as const,
        },
      ],
    },
  ];
}

export function SessionGridView({
  sessions,
  mockExams = [],
  onToggleTodo,
}: SessionGridViewProps) {
  const sections = categorizeSessions(sessions, mockExams);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {sections.map((section) => (
        <TodoSection
          key={section.id}
          section={section}
          onToggleTodo={onToggleTodo}
          isDraggedOver={false}
        />
      ))}
    </div>
  );
}
