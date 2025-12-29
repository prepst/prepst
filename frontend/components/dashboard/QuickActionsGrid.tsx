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
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))",
      iconColor: "text-amber-400",
      bg: "bg-amber-500/10",
      desc: "5 min drill",
    },
    {
      label: "Mock Exam",
      icon: Target,
      href: "/dashboard/mock-exam",
      gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
      iconColor: "text-blue-400",
      bg: "bg-blue-500/10",
      desc: "Full length test",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/progress",
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))",
      iconColor: "text-purple-400",
      bg: "bg-purple-500/10",
      desc: "Check stats",
    },
    {
      label: "Study Plan",
      icon: FileText,
      href: "/study-plan",
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      iconGlow: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))",
      iconColor: "text-emerald-400",
      bg: "bg-emerald-500/10",
      desc: "View schedule",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          onClick={() => router.push(action.href)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="group relative flex flex-col items-start p-4 rounded-2xl bg-card border-2 border-border/50 hover:bg-muted/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left overflow-hidden"
        >
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          {/* Icon container */}
          <div
            className={`relative z-10 p-2.5 rounded-xl ${action.bg} mb-3 group-hover:scale-110 transition-transform`}
            style={{ filter: action.iconGlow }}
          >
            <action.icon className={`w-5 h-5 ${action.iconColor}`} />
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-1">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              {action.label}
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-60 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
            </h3>
            <p className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">{action.desc}</p>
          </div>

          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
