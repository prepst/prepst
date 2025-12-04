"use client";

import {
  Home,
  BookOpen,
  TrendingUp,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  Settings,
  MessageCircle,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  RotateCcw,
  Video,
  Notebook,
  UserPlus,
  LogIn,
} from "lucide-react";
import { StatisticsPanel } from "@/components/dashboard/StatisticsPanel";
import { ProfileDropdown } from "@/components/dashboard/ProfileDropdown";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useStudyPlan } from "@/hooks/useQueries";
import { useProfile } from "@/hooks/queries";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { PracticeSession } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize sidebar collapsed state from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard-sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStudyPlanExpanded, setIsStudyPlanExpanded] = useState(true);
  const [isProgressExpanded, setIsProgressExpanded] = useState(true);
  const [isMockExamExpanded, setIsMockExamExpanded] = useState(true);
  const { theme, setTheme, isDarkMode } = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: profileData, isLoading } = useProfile();

  // Persist sidebar collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      localStorage.setItem(
        "dashboard-sidebar-collapsed",
        String(isSidebarCollapsed)
      );
    }
  }, [isSidebarCollapsed, isMobile]);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile (override saved state)
      if (mobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      } else {
        // On desktop, restore saved state
        const saved = localStorage.getItem("dashboard-sidebar-collapsed");
        if (saved !== null) {
          setIsSidebarCollapsed(saved === "true");
        }
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check if user is admin (based on user metadata or role)
  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    user?.app_metadata?.role === "admin";

  type NavItem = {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };

  const mainNavItems: NavItem[] = [
    // Mind Map commented out - keeping implementation as dead code
    // { name: "Mind Map", href: "/dashboard/mind-map", icon: Brain },
  ];

  const dashboardItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    {
      name: "Study Plan",
      href: "/dashboard/study-plan",
      icon: BookOpen,
      isCollapsible: true,
      subItems: [
        {
          name: "Practice",
          href: "/dashboard/study-plan",
          icon: PlayCircle,
        },
        {
          name: "Revision",
          href: "/dashboard/revision",
          icon: RotateCcw,
        },
        {
          name: "Drill",
          href: "/dashboard/drill",
          icon: Brain,
        },
      ],
    },
    {
      name: "Mock Exam",
      href: "/dashboard/mock-exam",
      icon: FileText,
      isCollapsible: true,
      subItems: [
        {
          name: "Mock Exam",
          href: "/dashboard/mock-exam",
          icon: FileText,
        },
        {
          name: "Mock Progress",
          href: "/dashboard/mock-progress",
          icon: BarChart3,
        },
      ],
    },
    {
      name: "Progress",
      href: "/dashboard/progress",
      icon: TrendingUp,
      isCollapsible: true,
      subItems: [
        {
          name: "Overview",
          href: "/dashboard/progress",
          icon: BarChart3,
        },
      ],
    },
    { name: "Manim", href: "/dashboard/manim", icon: Video },
    { name: "Notebook", href: "/dashboard/notebook", icon: Notebook },
  ];

  // Add admin analytics link if user is admin
  // Commented out - keeping implementation as dead code
  // if (isAdmin) {
  //   mainNavItems.push({
  //     name: "Admin Analytics",
  //     href: "/dashboard/admin/analytics",
  //     icon: Settings,
  //   });
  // }

  const accountItems = [
    { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const getDisplayName = () => {
    // Don't show anything until profile is loaded
    if (isLoading || !profileData) {
      return "";
    }

    const profile = profileData.profile;

    // First, try the name field (new schema)
    if ((profile as any).name) {
      return (profile as any).name;
    }

    // Fall back to combining first_name and last_name (old schema)
    if ((profile as any).first_name || (profile as any).last_name) {
      return [(profile as any).first_name, (profile as any).last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    // Try full_name (old schema)
    if ((profile as any).full_name) {
      return (profile as any).full_name;
    }

    // Fall back to auth user metadata
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }

    // Only show email as last resort
    if (profile.email) {
      return profile.email.split("@")[0];
    }

    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-start gap-6">
        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && !isSidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          key={`sidebar-${isMobile}-${isSidebarCollapsed}`}
          className={`transition-all duration-300 ease-in-out sticky top-0 h-screen flex-shrink-0 bg-card border-r border-border z-30 ${
            isSidebarCollapsed ? "w-[80px]" : "w-[280px]"
          } ${
            isMobile
              ? isSidebarCollapsed
                ? "w-0 overflow-hidden border-none" // Hide completely on mobile when collapsed
                : `fixed left-0 z-50 w-[280px] shadow-2xl ${
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                  }`
              : ""
          }`}
        >
          <div
            className={`flex flex-col h-full ${
              isMobile ? "px-4 pt-6" : "px-4 pt-8"
            }`}
          >
            {/* Toggle button aligned with menu items */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`absolute -right-3 top-8 w-8 h-8 bg-background rounded-full flex items-center justify-center hover:bg-muted transition-all duration-300 shadow-sm z-50 group ${
                isMobile ? "hidden" : "flex"
              }`}
              style={{
                border: "1px solid #866ffe",
              }}
            >
              {isSidebarCollapsed ? (
                <ChevronRight
                  className="w-4 h-4 transition-colors"
                  style={{ color: "#866ffe" }}
                />
              ) : (
                <ChevronLeft
                  className="w-4 h-4 transition-colors"
                  style={{ color: "#866ffe" }}
                />
              )}
            </button>

            {/* Main Navigation Section */}
            <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide py-2">
              {/* Dashboard Section */}
              <div className="space-y-2">
                {/* Dashboard Label */}
                {!isSidebarCollapsed && (
                  <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest px-4 mb-4">
                    Dashboard
                  </p>
                )}

                {/* Dashboard Items */}
                {dashboardItems.map((item) => {
                  const Icon = item.icon;
                  const hasActiveSubItem =
                    item.subItems &&
                    item.subItems.some((subItem) => pathname === subItem.href);
                  // Only highlight parent if it's directly active AND no sub-item is active
                  const isActive = pathname === item.href && !hasActiveSubItem;

                  if (item.isCollapsible) {
                    const isExpanded =
                      item.name === "Study Plan"
                        ? isStudyPlanExpanded
                        : item.name === "Mock Exam"
                        ? isMockExamExpanded
                        : isProgressExpanded;
                    const setExpanded =
                      item.name === "Study Plan"
                        ? setIsStudyPlanExpanded
                        : item.name === "Mock Exam"
                        ? setIsMockExamExpanded
                        : setIsProgressExpanded;

                    return (
                      <div key={item.name} className="space-y-1">
                        {/* Collapsible Header */}
                        <button
                          onClick={() => setExpanded(!isExpanded)}
                          className={`w-full flex items-center rounded-2xl transition-all duration-200 group ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground font-medium"
                          } ${
                            isSidebarCollapsed
                              ? "justify-center p-3 mx-auto w-12 h-12"
                              : `gap-3 py-3 px-4 mx-auto ${
                                  isMobile ? "py-4" : ""
                                } text-[15px]`
                          }`}
                          title={isSidebarCollapsed ? item.name : undefined}
                        >
                          <Icon
                            className={`flex-shrink-0 transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground"
                            } ${isSidebarCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
                          />
                          {!isSidebarCollapsed && (
                            <>
                              <span className="whitespace-nowrap flex-1 text-left">
                                {item.name}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground/70" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground/70" />
                              )}
                            </>
                          )}
                        </button>

                        {/* Sub-items */}
                        {!isSidebarCollapsed && isExpanded && item.subItems && (
                          <div className="mt-1 space-y-1 relative">
                            {/* Vertical line for hierarchy */}
                            <div className="absolute left-[26px] top-0 bottom-2 w-px bg-border/60" />

                            {item.subItems.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`flex items-center rounded-xl transition-all duration-200 relative z-10 ml-3 mr-2 ${
                                    isSubActive
                                      ? "bg-primary/5 text-primary font-medium"
                                      : "hover:bg-muted/50 hover:text-foreground text-muted-foreground"
                                  } gap-3 py-2.5 px-4 text-sm ${
                                    isMobile ? "py-3" : ""
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isSubActive
                                        ? "bg-primary"
                                        : "bg-muted-foreground/40"
                                    } flex-shrink-0`}
                                  />
                                  <span className="whitespace-nowrap">
                                    {subItem.name}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Regular navigation item
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center rounded-2xl transition-all duration-200 group ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-muted/60 hover:text-foreground text-muted-foreground font-medium"
                      } ${
                        isSidebarCollapsed
                          ? "justify-center p-3 mx-auto w-12 h-12"
                          : `gap-3 py-3 px-4 ${
                              isMobile ? "py-4" : ""
                            } text-[15px]`
                      }`}
                      title={isSidebarCollapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`flex-shrink-0 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        } ${isSidebarCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
                      />
                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Main Navigation Items */}
              {mainNavItems.length > 0 && (
                <div className="space-y-2">
                  {!isSidebarCollapsed && (
                    <div className="h-px bg-border/50 mx-4 my-2" />
                  )}
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center rounded-2xl transition-all duration-200 group ${
                          isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : item.name === "Mind Map"
                            ? "hover:bg-accent text-purple-500"
                            : "hover:bg-muted/60 hover:text-foreground text-muted-foreground font-medium"
                        } ${
                          isSidebarCollapsed
                            ? "justify-center p-3 mx-auto w-12 h-12"
                            : `gap-3 py-3 px-4 ${
                                isMobile ? "py-4" : ""
                              } text-[15px]`
                        }`}
                        title={isSidebarCollapsed ? item.name : undefined}
                      >
                        <Icon
                          className={`flex-shrink-0 transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          } ${isSidebarCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
                        />
                        {!isSidebarCollapsed && (
                          <span className="whitespace-nowrap">{item.name}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Account section */}
            <div className="space-y-3 pb-6">
              {!isSidebarCollapsed && (
                <div className="h-px bg-border/50 mx-4 mb-2" />
              )}

              {/* Account Menu Items */}
              {accountItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-2xl transition-all duration-200 group ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted/60 hover:text-foreground text-muted-foreground font-medium"
                    } ${
                      isSidebarCollapsed
                        ? "justify-center p-3 mx-auto w-12 h-12"
                        : `gap-3 py-3 px-4 ${
                            isMobile ? "py-4" : ""
                          } text-[15px]`
                    }`}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <Icon
                      className={`flex-shrink-0 transition-colors ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      } ${isSidebarCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                );
              })}

              {/* Profile Section - Show for signed in users */}
              {user && (
                <div className={`mt-2 ${isSidebarCollapsed ? "mx-auto" : ""}`}>
                  <ProfileDropdown isSidebarCollapsed={isSidebarCollapsed} />
                </div>
              )}
            </div>

            {/* Auth buttons for non-signed in users */}
            {!user && (
              <div className="space-y-3 pb-6 px-2">
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl ${
                      isSidebarCollapsed
                        ? "h-12 w-12 p-0 rounded-2xl flex items-center justify-center"
                        : "h-11"
                    }`}
                    size="sm"
                  >
                    {isSidebarCollapsed ? (
                      <UserPlus className="w-5 h-5" />
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </Link>
                <Link href="/login" className="block">
                  <Button
                    variant="outline"
                    className={`w-full border-border hover:bg-muted/50 rounded-xl ${
                      isSidebarCollapsed
                        ? "h-12 w-12 p-0 rounded-2xl flex items-center justify-center"
                        : "h-11"
                    }`}
                    size="sm"
                  >
                    {isSidebarCollapsed ? (
                      <LogIn className="w-5 h-5" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          className={`flex-1 min-w-0 overflow-x-hidden ${
            isMobile ? "pt-4 px-4" : "pt-6 px-6"
          }`}
        >
          {children}
        </main>

        {/* Right Statistics Panel - COMMENTED OUT */}

        <div className="hidden lg:block pl-3 pr-4 pt-6">
          <StatisticsPanel
            userName={getDisplayName()}
            progressPercentage={32}
            currentSession={{
              number: 2,
              title: "Text Structure and Purpose",
            }}
          />
        </div>
      </div>
    </div>
  );
}
