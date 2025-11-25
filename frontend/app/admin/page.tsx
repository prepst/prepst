"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  FileQuestion,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
} from "lucide-react";
import Link from "next/link";

interface QuestionStats {
  total_questions: number;
  active_questions: number;
  inactive_questions: number;
  math_questions: number;
  english_questions: number;
  by_difficulty: {
    E: number;
    M: number;
    H: number;
  };
  empty_answers: number;
  missing_rationale: number;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.getQuestionStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage questions, view analytics, and monitor system health
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/questions"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <FileQuestion className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Manage Questions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Search, edit, and disable questions
          </p>
        </Link>

        <Link
          href="/admin/questions?filter=inactive"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <AlertTriangle className="w-8 h-8 text-yellow-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Review Issues
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {stats?.inactive_questions || 0} questions need attention
          </p>
        </Link>

        <Link
          href="/admin/analytics"
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
        >
          <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            View Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            User progress and system metrics
          </p>
        </Link>

        <button
          onClick={() => loadStats()}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 text-left"
        >
          <Activity className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Refresh Stats
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update dashboard data
          </p>
        </button>
      </div>

      {/* Question Health */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Question Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Questions */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.total_questions || 0}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Total Questions
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>Math: {stats?.math_questions || 0}</div>
              <div>English: {stats?.english_questions || 0}</div>
            </div>
          </div>

          {/* Active/Inactive */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-600">
                {stats?.active_questions || 0}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Active Questions
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {stats?.inactive_questions || 0} inactive
              </span>
            </div>
          </div>

          {/* Issues */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-600">
                {(stats?.empty_answers || 0) + (stats?.missing_rationale || 0)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Needs Review
            </h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>Empty answers: {stats?.empty_answers || 0}</div>
              <div>Missing rationale: {stats?.missing_rationale || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Distribution */}
      {stats?.by_difficulty && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Difficulty Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.by_difficulty.E || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Easy Questions
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.by_difficulty.M || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Medium Questions
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.by_difficulty.H || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Hard Questions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          System Status
        </h2>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">API</span>
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Responding
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Last Updated
              </span>
              <span className="text-gray-900 dark:text-white">
                {new Date().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
