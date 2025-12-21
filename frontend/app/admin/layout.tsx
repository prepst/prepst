"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileQuestion,
  // BarChart3, // Removed - analytics link commented out
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Video,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user is admin - check both user_metadata and backend API
    const checkAdminStatus = async () => {
      setIsCheckingAdmin(true);
      try {
        // First check user_metadata (quick check)
        const metadataAdmin = user?.user_metadata?.role === "admin";

        if (metadataAdmin) {
          setIsCheckingAdmin(false);
          return;
        }

        // If not in metadata, check backend API (users table)
        try {
          const userData = await api.get("/api/auth/me");
          const isAdmin = userData?.role === "admin" || metadataAdmin;

          if (!isAdmin) {
            router.push("/dashboard");
          }
        } catch (error) {
          // If API call fails, fall back to metadata check
          if (!metadataAdmin) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        // Fallback: check only metadata
        const metadataAdmin = user?.user_metadata?.role === "admin";
        if (!metadataAdmin) {
          router.push("/dashboard");
        }
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, router, loading]);

  const adminNavItems = [
    {
      name: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Questions",
      href: "/admin/questions",
      icon: FileQuestion,
    },
    {
      name: "Manim Generator",
      href: "/admin/manim",
      icon: Video,
    },
    // Analytics link commented out - keeping implementation as dead code
    // {
    //   name: "Analytics",
    //   href: "/admin/analytics",
    //   icon: BarChart3,
    // },
  ];

  if (loading || !user || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
                A
              </div>
              <span className="font-semibold">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Quick Action */}
        <div className="p-4 border-b border-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {isSidebarOpen && (
              <span className="text-sm">Back to Dashboard</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.email}
                </div>
                <div className="text-xs text-gray-400">Admin</div>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}
