"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [module, setModule] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [questionType, setQuestionType] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch questions with current filters
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-questions", { search, module, difficulty, questionType, isActive, page }],
    queryFn: () =>
      api.listQuestions({
        search: search || undefined,
        module: module === "all" ? undefined : module,
        difficulty: difficulty === "all" ? undefined : difficulty,
        question_type: questionType === "all" ? undefined : questionType,
        is_active: isActive === "all" ? undefined : isActive === "true",
        limit,
        offset: page * limit,
      }),
  });

  const questions = data?.questions || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Module Filter */}
          <Select value={module} onValueChange={(v) => { setModule(v); setPage(0); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="math">Math</SelectItem>
              <SelectItem value="english">Reading & Writing</SelectItem>
            </SelectContent>
          </Select>

          {/* Difficulty Filter */}
          <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(0); }}>
            <SelectTrigger>
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
          <Select value={questionType} onValueChange={(v) => { setQuestionType(v); setPage(0); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mc">Multiple Choice</SelectItem>
              <SelectItem value="spr">Student Response</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Status Filter */}
          <Select value={isActive} onValueChange={(v) => { setIsActive(v); setPage(0); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
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
              setPage(0);
            }}
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
                    let questionText = question.stem || question.prompt || "No question text";

                    // Strip common prefixes from similar questions
                    questionText = questionText
                      .replace(/<p>\s*This is a similar question to help you practice the same concept\.\s*/gi, "<p>")
                      .replace(/^\s*This is a similar question to help you practice the same concept\.\s*/gi, "")
                      .trim();

                    // Strip HTML tags for preview
                    const textOnly = questionText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
                    const truncated = textOnly.length > 100
                      ? textOnly.substring(0, 100) + "..."
                      : textOnly;

                    return (
                      <tr
                        key={question.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 max-w-md">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            <div className="line-clamp-2">
                              {truncated}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {question.external_id || question.id.substring(0, 8)}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/questions/${question.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Test
                          </Button>
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
                Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of{" "}
                {totalCount} questions
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
