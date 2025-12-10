"use client";

import { MockExamPerformance } from "@/components/analytics/MockExamPerformance";
import { useMockExamAnalytics } from "@/hooks/queries";

export default function MockProgressPage() {
  const {
    data: mockExamData,
    isLoading: mockExamLoading,
    isError: mockExamError,
  } = useMockExamAnalytics();

  return (
    <div className="min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-7xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">
              Mock Exam Progress
            </h1>
            <p className="text-muted-foreground">
              Track your performance trends and score improvements over time.
            </p>
          </div>

          <MockExamPerformance
            data={mockExamData}
            isLoading={mockExamLoading}
            isError={mockExamError}
          />
        </div>
      </div>
    </div>
  );
}
