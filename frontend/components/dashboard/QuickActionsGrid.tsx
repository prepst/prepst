"use client";

import {
  Play,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function QuickActionsGrid() {
  const router = useRouter();

  const actions = [
    {
      label: "Quick Practice",
      icon: Zap,
      href: "/dashboard/study-plan",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      desc: "5 min drill",
    },
    {
      label: "Mock Exam",
      icon: Target,
      href: "/dashboard/mock-exam",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Full length test",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/progress",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      desc: "Check stats",
    },
    {
      label: "Study Plan",
      icon: FileText,
      href: "/study-plan",
      color: "text-green-500",
      bg: "bg-green-500/10",
      desc: "View schedule",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          onClick={() => router.push(action.href)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="group relative flex flex-col items-start p-4 rounded-2xl bg-card border-2 border-border/50 hover:bg-muted/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
        >
          <div
            className={`p-2.5 rounded-xl ${action.bg} ${action.color} mb-3 group-hover:scale-110 transition-transform`}
          >
            <action.icon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1">
              {action.label}
              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </h3>
            <p className="text-xs text-muted-foreground">{action.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
