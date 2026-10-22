"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  BookOpen,
  Brain,
  Database,
  FileText,
  History,
  Home,
  LogOut,
  Menu,
  RotateCcw,
  Settings,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const primaryItems: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Plan", href: "/dashboard/study-plan", icon: BookOpen },
  { name: "Drill", href: "/dashboard/drill", icon: Brain },
  { name: "Mock", href: "/dashboard/mock-exam", icon: FileText },
];

const moreItems: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Sessions", href: "/dashboard/sessions", icon: History },
  { name: "Revision", href: "/dashboard/revision", icon: RotateCcw },
  { name: "Questions", href: "/dashboard/question-pool", icon: Database },
  { name: "Vocab", href: "/dashboard/vocab", icon: BookMarked },
  { name: "Progress", href: "/dashboard/progress", icon: TrendingUp },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavMark({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className: string;
}) {
  return <Icon className={className} aria-hidden="true" />;
}

function isCurrent(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isDarkMode, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const moreIsCurrent = moreItems.some((item) => isCurrent(pathname, item.href));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" aria-label="Prep St home">
          <img src="/prepst.svg" alt="" className="h-9 w-auto" />
        </Link>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5">
          {primaryItems.map((item) => {
            const active = isCurrent(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={user || item.href === "/dashboard" ? item.href : "/login"}
                  className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <NavMark icon={item.icon} className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`flex w-full flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                open || moreIsCurrent ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              More
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Menu</h2>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {!user && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
            <ul className="space-y-1">
              {moreItems.map((item) => {
                const active = isCurrent(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={user || item.href === "/dashboard" ? item.href : "/login"}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                        active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <NavMark icon={item.icon} className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border px-3 py-3">
              <span className="text-sm font-medium">Dark mode</span>
              <Switch
                checked={isDarkMode}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
            {user && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
