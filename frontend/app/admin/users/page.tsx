"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Users, Mail, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserInfo {
  id: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserCountResponse {
  total_users: number;
}

export default function AdminUsersPage() {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [userData, countData] = await Promise.all([
        api.get("/api/auth/me"),
        api.get("/api/auth/admin/users/count"),
      ]);

      setCurrentUser(userData as UserInfo);
      setTotalUsers((countData as UserCountResponse).total_users);
    } catch (err) {
      console.error("Failed to load user data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load user information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading user information...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Information
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View current user details and system user count
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current User Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Current User</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {currentUser?.email || authUser?.email || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Role
                  </div>
                  <div>
                    <Badge
                      variant={
                        currentUser?.role === "admin" ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {currentUser?.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </div>
                </div>
              </div>

              {currentUser?.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Account Created
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(currentUser.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentUser?.id && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    User ID
                  </div>
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                    {currentUser.id}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Users Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>System Statistics</CardTitle>
                <CardDescription>Total registered users</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {totalUsers !== null ? totalUsers.toLocaleString() : "—"}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  Total Users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
