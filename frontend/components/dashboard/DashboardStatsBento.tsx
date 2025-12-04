"use client";

import {
    motion,
    useMotionValue,
    useTransform,
} from "framer-motion";
import { useState } from "react";
import {
    Clock,
    Target,
    Flame,
    CheckCircle2,
    LucideIcon
} from "lucide-react";

interface DashboardStatItem {
    id: string;
    label: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    color: "orange" | "purple" | "green" | "blue";
    progress?: number;
    link?: string;
}

interface StatCardProps {
    item: DashboardStatItem;
}

const StatCard = ({ item }: StatCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]);
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 100);
        y.set(yPct * 100);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        setIsHovered(false);
    }

    const colors = {
        orange: {
            bg: "from-orange-500/20 via-orange-500/5 to-transparent",
            border: "border-orange-500/20",
            text: "text-orange-600 dark:text-orange-400",
            iconBg: "bg-orange-500",
            glow: "group-hover:shadow-orange-500/20",
        },
        purple: {
            bg: "from-purple-500/20 via-purple-500/5 to-transparent",
            border: "border-purple-500/20",
            text: "text-purple-600 dark:text-purple-400",
            iconBg: "bg-purple-500",
            glow: "group-hover:shadow-purple-500/20",
        },
        green: {
            bg: "from-emerald-500/20 via-emerald-500/5 to-transparent",
            border: "border-emerald-500/20",
            text: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-500",
            glow: "group-hover:shadow-emerald-500/20",
        },
        blue: {
            bg: "from-blue-500/20 via-blue-500/5 to-transparent",
            border: "border-blue-500/20",
            text: "text-blue-600 dark:text-blue-400",
            iconBg: "bg-blue-500",
            glow: "group-hover:shadow-blue-500/20",
        },
    };

    const theme = colors[item.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="h-full"
            style={{
                perspective: 1000,
            }}
        >
            <motion.div
                className={`
                    group relative flex flex-col justify-between h-full w-full rounded-2xl p-5
                    aspect-[1/1]
                    bg-gradient-to-br ${theme.bg}
                    border ${theme.border}
                    backdrop-blur-sm
                    transition-all duration-300 ease-out
                    shadow-lg ${theme.glow}
                    hover:scale-[1.02]
                `}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                    transformStyle: "preserve-3d",
                }}
            >
                 {/* Background pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-2xl">
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${item.color}-500 rounded-full blur-3xl`}></div>
                    <div className={`absolute -bottom-10 -left-10 w-32 h-32 bg-${item.color}-500 rounded-full blur-3xl`}></div>
                </div>

                <div className="relative z-10 flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${theme.iconBg} shadow-lg text-white transform transition-transform group-hover:rotate-6`}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    {item.progress !== undefined && (
                         <div className="relative w-10 h-10 flex items-center justify-center">
                            <svg className="transform -rotate-90 w-full h-full">
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="16"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="transparent"
                                    className={`${theme.text} opacity-20`}
                                />
                                <circle
                                    cx="20"
                                    cy="20"
                                    r="16"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 16}
                                    strokeDashoffset={2 * Math.PI * 16 * (1 - item.progress / 100)}
                                    className={theme.text}
                                />
                            </svg>
                            <span className={`absolute text-[9px] font-bold ${theme.text}`}>{Math.round(item.progress)}%</span>
                        </div>
                    )}
                </div>

                <div className="relative z-10">
                    <h3 className={`text-xs font-medium ${theme.text} mb-0.5`}>{item.label}</h3>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-foreground">{item.value}</span>
                    </div>
                     <p className={`text-[11px] mt-0.5 opacity-80 ${theme.text}`}>{item.subValue}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function DashboardStatsBento({
    streak = 0,
    studyTime = "0h 0m",
    questionsDone = 0,
    mockExams = 0,
    studyTimeGoal = "2h 0m",
    questionsGoal = 50,
}: {
    streak: number;
    studyTime: string;
    questionsDone: number;
    mockExams: number;
    studyTimeGoal?: string;
    questionsGoal?: number;
}) {
    
    // Parse study time to calculate progress (rough estimate)
    const parseTime = (timeStr: string) => {
        const hours = parseInt(timeStr.split('h')[0]) || 0;
        const minutes = parseInt(timeStr.split('h')[1]?.split('m')[0]) || 0;
        return hours * 60 + minutes;
    };
    
    const currentMinutes = parseTime(studyTime);
    const goalMinutes = parseTime(studyTimeGoal || "2h 0m");
    const timeProgress = Math.min(100, (currentMinutes / goalMinutes) * 100);
    const questionProgress = Math.min(100, (questionsDone / (questionsGoal || 50)) * 100);

    const stats: DashboardStatItem[] = [
        {
            id: "streak",
            label: "Study Streak",
            value: `${streak} days`,
            subValue: "Keep the flame alive!",
            icon: Flame,
            color: "orange",
            progress: Math.min(100, (streak / 7) * 100), // Weekly streak goal?
        },
        {
            id: "time",
            label: "Study Time",
            value: studyTime,
            subValue: `Goal: ${studyTimeGoal}`,
            icon: Clock,
            color: "purple",
            progress: timeProgress,
        },
        {
            id: "questions",
            label: "Questions Done",
            value: questionsDone,
            subValue: `Goal: ${questionsGoal}/week`,
            icon: CheckCircle2,
            color: "green",
            progress: questionProgress,
        },
        {
            id: "mock",
            label: "Mock Exams",
            value: mockExams,
            subValue: "Full length tests",
            icon: Target,
            color: "blue",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {stats.map((item) => (
                <StatCard key={item.id} item={item} />
            ))}
        </div>
    );
}
