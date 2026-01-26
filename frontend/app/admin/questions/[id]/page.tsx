"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { useAdminQuestionDetail, useUpdateQuestion } from "@/hooks/queries/useAdminQuestions";

export default function AdminQuestionTestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = params.id as string;

  // Get filter params from URL to preserve when going back
  const getBackUrl = () => {
    const filterParams = searchParams.toString();
    return `/admin/questions${filterParams ? `?${filterParams}` : ""}`;
  };

  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  // Fetch question details
  const { data: adminQuestion, isLoading } = useAdminQuestionDetail(questionId);

  // Update mutation
  const updateMutation = useUpdateQuestion(questionId);

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
          <Button onClick={() => router.push(getBackUrl())} className="mt-4">
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
    updateMutation.mutate(editedData, {
      onSuccess: () => {
        setIsEditMode(false);
        setEditedData({});
      },
    });
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
                onClick={() => router.push(getBackUrl())}
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
        <QuestionPanel 
          key={sessionQuestion.session_question_id}
          question={sessionQuestion} 
        />
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
                    explanation: adminQuestion.rationale,
                    hints: [],
                    learning_points: [],
                    key_concepts: [],
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
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Question Metadata</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
            {/* Stimulus (for English questions) */}
            {adminQuestion.module === "english" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stimulus (Reading Passage)
                </label>
                <Textarea
                  value={editedData.stimulus ?? adminQuestion.stimulus ?? ""}
                  onChange={(e) => handleEditChange("stimulus", e.target.value)}
                  rows={6}
                  placeholder="Enter the reading passage or context..."
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Answer Options (for Multiple Choice) */}
            {adminQuestion.question_type === "mc" && adminQuestion.answer_options && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer Options
                </label>
                {(() => {
                  // Normalize answer_options to object format
                  const currentOptions = editedData.answer_options ?? adminQuestion.answer_options;
                  let optionsObj: Record<string, string> = {};
                  
                  if (Array.isArray(currentOptions)) {
                    // Convert array format to object
                    currentOptions.forEach((opt: any, idx: number) => {
                      const label = ["A", "B", "C", "D", "E", "F"][idx];
                      if (opt.content) {
                        optionsObj[label] = opt.content;
                      } else if (typeof opt === "string") {
                        optionsObj[label] = opt;
                      } else if (Array.isArray(opt) && opt.length > 1) {
                        optionsObj[label] = String(opt[1]);
                      }
                    });
                  } else if (typeof currentOptions === "object") {
                    optionsObj = currentOptions;
                  }

                  // Get current correct answer
                  const currentCorrect = editedData.correct_answer?.[0] ?? adminQuestion.correct_answer?.[0] ?? "";
                  
                  return (
                    <>
                      {["A", "B", "C", "D", "E", "F"].map((label) => {
                        if (!optionsObj[label] && Object.keys(optionsObj).length === 0) return null;
                        return (
                          <div key={label} className="flex items-start gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-semibold text-sm w-6">{label}</span>
                              <Input
                                value={editedData.answer_options?.[label] ?? optionsObj[label] ?? ""}
                                onChange={(e) => {
                                  const newOptions = {
                                    ...(editedData.answer_options ?? optionsObj),
                                    [label]: e.target.value,
                                  };
                                  handleEditChange("answer_options", newOptions);
                                }}
                                placeholder={`Option ${label}...`}
                                className="flex-1"
                              />
                            </div>
                            <Button
                              type="button"
                              variant={currentCorrect === label ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                handleEditChange("correct_answer", [label]);
                              }}
                              className="shrink-0"
                            >
                              {currentCorrect === label ? "✓ Correct" : "Set Correct"}
                            </Button>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Correct Answer (for SPR) */}
            {adminQuestion.question_type === "spr" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  placeholder="Enter correct answer..."
                />
              </div>
            )}

            {/* Acceptable Answers (for SPR) */}
            {adminQuestion.question_type === "spr" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acceptable Answers (comma-separated)
                </label>
                <Input
                  value={
                    editedData.acceptable_answers?.join(", ") ||
                    (adminQuestion.acceptable_answers || []).join(", ") ||
                    ""
                  }
                  onChange={(e) => {
                    const values = e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter((v) => v.length > 0);
                    handleEditChange("acceptable_answers", values);
                  }}
                  placeholder="e.g., 42, 42.0, forty-two"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            </div>

            {/* Question Stem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question Stem
              </label>
              <Textarea
                value={editedData.stem ?? adminQuestion.stem ?? ""}
                onChange={(e) => handleEditChange("stem", e.target.value)}
                rows={4}
                placeholder="Enter the question text..."
                className="font-mono text-sm"
              />
            </div>

            {/* Rationale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

          <div className="flex justify-end gap-2 pt-4 border-t">
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
