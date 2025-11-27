"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { QuestionPanel } from "@/components/practice/QuestionPanel";
import { AnswerPanel } from "@/components/practice/AnswerPanel";
import { ArrowLeft, Edit, Save, X, RotateCcw } from "lucide-react";
import { transformToSessionQuestion } from "@/lib/admin-question-utils";
import type { AnswerState } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminQuestionTestPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const questionId = params.id as string;

  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  // Fetch question details
  const { data: adminQuestion, isLoading } = useQuery({
    queryKey: ["admin-question-detail", questionId],
    queryFn: () => api.getQuestionDetail(questionId),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (updates: any) => api.updateQuestion(questionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-question-detail", questionId],
      });
      setIsEditMode(false);
      setEditedData({});
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!adminQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Question not found</p>
          <Button onClick={() => router.push("/admin/questions")} className="mt-4">
            Back to Questions
          </Button>
        </div>
      </div>
    );
  }

  // Transform to SessionQuestion format for practice components
  const sessionQuestion = transformToSessionQuestion(adminQuestion);

  const handleAnswerChange = (value: string) => {
    if (showFeedback) return;
    setAnswer({
      userAnswer: [value],
      isCorrect: false,
      status: "not_started",
    });
  };

  const handleSubmit = () => {
    if (!answer) return;

    // Check if answer is correct
    const correctAnswer = adminQuestion.correct_answer;
    const userAnswer = answer.userAnswer[0];

    let isCorrect = false;

    if (adminQuestion.question_type === "mc") {
      // For MC, compare with letter (A, B, C, D)
      const correctLetter = Array.isArray(correctAnswer)
        ? correctAnswer[0]
        : correctAnswer;
      isCorrect = userAnswer === correctLetter ||
                  // Also check if user selected the UUID and it matches
                  adminQuestion.answer_options?.[correctLetter] === userAnswer;
    } else {
      // For SPR, compare numerical/text answers
      const acceptable = [
        ...(Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]),
        ...(adminQuestion.acceptable_answers || []),
      ];
      isCorrect = acceptable.some(
        (ans) =>
          String(ans).trim().toLowerCase() === userAnswer.trim().toLowerCase()
      );
    }

    setAnswer({ ...answer, isCorrect });
    setShowFeedback(true);
  };

  const handleReset = () => {
    setAnswer(null);
    setShowFeedback(false);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(editedData);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Admin Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/questions")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    adminQuestion.difficulty === "E"
                      ? "bg-emerald-100 text-emerald-700"
                      : adminQuestion.difficulty === "M"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {adminQuestion.difficulty === "E"
                    ? "Easy"
                    : adminQuestion.difficulty === "M"
                    ? "Medium"
                    : "Hard"}
                </span>
                <span className="text-sm text-gray-600 capitalize">
                  {adminQuestion.module}
                </span>
                <span className="text-sm text-gray-600 uppercase">
                  {adminQuestion.question_type}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    adminQuestion.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {adminQuestion.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Answer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Metadata
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Practice Session Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question */}
        <div className="flex-1 flex flex-col min-w-0">
          <QuestionPanel question={sessionQuestion} />
        </div>

        {/* Divider */}
        <div className="w-1 bg-gray-300" />

        {/* Right Panel - Answer */}
        <div
          className="border-l bg-white/60 backdrop-blur-sm flex flex-col"
          style={{ width: "480px" }}
        >
          <AnswerPanel
            question={sessionQuestion}
            answer={answer}
            showFeedback={showFeedback}
            aiFeedback={
              showFeedback && adminQuestion.rationale
                ? {
                    feedback: adminQuestion.rationale,
                    key_concepts: [],
                    common_mistakes: [],
                  }
                : null
            }
            loadingFeedback={false}
            onAnswerChange={handleAnswerChange}
            onGetFeedback={() => {}} // Rationale shown automatically
            // No similar question or save question in admin mode
          />

          {/* Submit Button */}
          {!showFeedback && (
            <div className="p-4 border-t bg-white/70">
              <Button
                onClick={handleSubmit}
                disabled={!answer}
                className="w-full"
              >
                Submit Answer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Metadata Modal */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question Metadata</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <Select
                  value={editedData.difficulty || adminQuestion.difficulty}
                  onValueChange={(v) => handleEditChange("difficulty", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E">Easy</SelectItem>
                    <SelectItem value="M">Medium</SelectItem>
                    <SelectItem value="H">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={String(editedData.is_active ?? adminQuestion.is_active)}
                  onValueChange={(v) => handleEditChange("is_active", v === "true")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {adminQuestion.question_type === "spr" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <Input
                    value={
                      editedData.correct_answer?.[0] ||
                      adminQuestion.correct_answer?.[0] ||
                      ""
                    }
                    onChange={(e) =>
                      handleEditChange("correct_answer", [e.target.value])
                    }
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rationale
              </label>
              <Textarea
                value={editedData.rationale ?? adminQuestion.rationale ?? ""}
                onChange={(e) => handleEditChange("rationale", e.target.value)}
                rows={6}
                placeholder="Add explanation for the correct answer..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditMode(false);
                setEditedData({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
