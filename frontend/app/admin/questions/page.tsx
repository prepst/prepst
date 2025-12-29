"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
} from "lucide-react";
import {
  useAdminQuestions,
  useToggleQuestionStatus,
} from "@/hooks/queries/useAdminQuestions";

export default function AdminQuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [module, setModule] = useState<string>(
    searchParams.get("module") || "all"
  );
  const [difficulty, setDifficulty] = useState<string>(
    searchParams.get("difficulty") || "all"
  );
  const [questionType, setQuestionType] = useState<string>(
    searchParams.get("questionType") || "all"
  );
  const [isActive, setIsActive] = useState<string>(
    searchParams.get("isActive") || "all"
  );
  const [isFlagged, setIsFlagged] = useState<string>(
    searchParams.get("isFlagged") || "all"
  );
  const [hasPngInStem, setHasPngInStem] = useState<string>(
    searchParams.get("hasPngInStem") || "all"
  );
  const [hasPngInAnswers, setHasPngInAnswers] = useState<string>(
    searchParams.get("hasPngInAnswers") || "all"
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "0", 10)
  );
  const limit = 20;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (module !== "all") params.set("module", module);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (questionType !== "all") params.set("questionType", questionType);
    if (isActive !== "all") params.set("isActive", isActive);
    if (isFlagged !== "all") params.set("isFlagged", isFlagged);
    if (hasPngInStem !== "all") params.set("hasPngInStem", hasPngInStem);
    if (hasPngInAnswers !== "all")
      params.set("hasPngInAnswers", hasPngInAnswers);
    if (page > 0) params.set("page", page.toString());

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : "/admin/questions";
    router.replace(newUrl, { scroll: false });
  }, [
    search,
    module,
    difficulty,
    questionType,
    isActive,
    isFlagged,
    hasPngInStem,
    hasPngInAnswers,
    page,
    router,
  ]);

  // Fetch questions with current filters
  const { data, isLoading, error } = useAdminQuestions({
    search: search || undefined,
    module,
    difficulty,
    question_type: questionType,
    is_active: isActive === "all" ? undefined : isActive === "true",
    is_flagged: isFlagged === "all" ? undefined : isFlagged === "true",
    has_png_in_stem:
      hasPngInStem === "all" ? undefined : hasPngInStem === "true",
    has_png_in_answers:
      hasPngInAnswers === "all" ? undefined : hasPngInAnswers === "true",
    limit,
    offset: page * limit,
  });

  const questions = data?.questions || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Toggle question active status mutation
  const toggleActiveMutation = useToggleQuestionStatus();

  const handleToggleActive = (questionId: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      questionId,
      isActive: !currentStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Question Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Search, filter, and manage all questions in the question bank
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Search - Full Width */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters - Compact Layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Module Filter */}
          <Select
            value={module}
            onValueChange={(v) => {
              setModule(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="math">Math</SelectItem>
              <SelectItem value="english">Reading & Writing</SelectItem>
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select
            value={difficulty}
            onValueChange={(v) => {
              setDifficulty(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="E">Easy</SelectItem>
              <SelectItem value="M">Medium</SelectItem>
              <SelectItem value="H">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select
            value={questionType}
            onValueChange={(v) => {
              setQuestionType(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mc">Multiple Choice</SelectItem>
              <SelectItem value="spr">Student Response</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={isActive}
            onValueChange={(v) => {
              setIsActive(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Flagged Filter */}
          <Select
            value={isFlagged}
            onValueChange={(v) => {
              setIsFlagged(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Flag?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Flag</SelectItem>
              <SelectItem value="true">Flagged</SelectItem>
              <SelectItem value="false">Not Flagged</SelectItem>
            </SelectContent>
          </Select>

          {/* PNG in Question Filter */}
          <Select
            value={hasPngInStem}
            onValueChange={(v) => {
              setHasPngInStem(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="PNG in Question" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Png in Question</SelectItem>
              <SelectItem value="true">Has PNG in Question</SelectItem>
              <SelectItem value="false">No PNG in Question</SelectItem>
            </SelectContent>
          </Select>

          {/* PNG in Answers Filter */}
          <Select
            value={hasPngInAnswers}
            onValueChange={(v) => {
              setHasPngInAnswers(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="PNG in Answers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">PNG in Answers</SelectItem>
              <SelectItem value="true">Has PNG in Answers</SelectItem>
              <SelectItem value="false">No PNG in Answers</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setModule("all");
              setDifficulty("all");
              setQuestionType("all");
              setIsActive("all");
              setIsFlagged("all");
              setHasPngInStem("all");
              setHasPngInAnswers("all");
              setPage(0);
            }}
            className="ml-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600">Error loading questions</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No questions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {questions.map((question: any) => {
                    let questionText =
                      question.stem || question.prompt || "No question text";

                    // Strip common prefixes from similar questions
                    questionText = questionText
                      .replace(
                        /<p>\s*This is a similar question to help you practice the same concept\.\s*/gi,
                        "<p>"
                      )
                      .replace(
                        /^\s*This is a similar question to help you practice the same concept\.\s*/gi,
                        ""
                      )
                      .trim();

                    // Strip HTML tags for preview
                    const textOnly = questionText
                      .replace(/<[^>]*>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim();
                    const truncated =
                      textOnly.length > 100
                        ? textOnly.substring(0, 100) + "..."
                        : textOnly;

                    return (
                      <tr
                        key={question.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 max-w-md">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            <div className="line-clamp-2">{truncated}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID:{" "}
                            {question.external_id ||
                              question.id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                            {question.module}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {question.topics?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              question.difficulty === "E"
                                ? "bg-emerald-100 text-emerald-700"
                                : question.difficulty === "M"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {question.difficulty === "E"
                              ? "Easy"
                              : question.difficulty === "M"
                              ? "Medium"
                              : "Hard"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-gray-100 uppercase">
                            {question.question_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              question.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {question.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleActive(
                                  question.id,
                                  question.is_active
                                )
                              }
                              disabled={toggleActiveMutation.isPending}
                              title={
                                question.is_active
                                  ? "Disable question"
                                  : "Enable question"
                              }
                            >
                              {question.is_active ? (
                                <PowerOff className="w-4 h-4 text-orange-500" />
                              ) : (
                                <Power className="w-4 h-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Preserve current filters in URL when navigating to question detail
                                const params = new URLSearchParams();
                                if (search) params.set("search", search);
                                if (module !== "all")
                                  params.set("module", module);
                                if (difficulty !== "all")
                                  params.set("difficulty", difficulty);
                                if (questionType !== "all")
                                  params.set("questionType", questionType);
                                if (isActive !== "all")
                                  params.set("isActive", isActive);
                                if (isFlagged !== "all")
                                  params.set("isFlagged", isFlagged);
                                if (hasPngInStem !== "all")
                                  params.set("hasPngInStem", hasPngInStem);
                                if (hasPngInAnswers !== "all")
                                  params.set(
                                    "hasPngInAnswers",
                                    hasPngInAnswers
                                  );
                                if (page > 0)
                                  params.set("page", page.toString());

                                const queryString = params.toString();
                                router.push(
                                  `/admin/questions/${question.id}${
                                    queryString ? `?${queryString}` : ""
                                  }`
                                );
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Test
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {page * limit + 1} to{" "}
                {Math.min((page + 1) * limit, totalCount)} of {totalCount}{" "}
                questions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page + 1} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
