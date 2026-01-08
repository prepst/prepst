"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BookMarked } from "lucide-react";

export default function VocabPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <BookMarked className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Build in Progress
            </h1>
            <p className="text-muted-foreground">
              Vocabulary feature is coming soon
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}







