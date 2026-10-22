import type { LucideIcon } from "lucide-react";
import {
    BarChart3,
    BookMarked,
    BookOpen,
    Bookmark,
    Brain,
    CalendarCheck,
    ClipboardCheck,
    Database,
    LayoutDashboard,
    MessageCircle,
    MessagesSquare,
    RotateCcw,
    Search,
    Settings,
    Share2,
    Sparkles,
    Target,
    Timer,
    TrendingUp,
    UserRound,
} from "lucide-react";

export interface OnboardingStep {
    icon: LucideIcon;
    title: string;
    description: string;
}

export const ONBOARDING_CONTENT: Record<string, OnboardingStep[]> = {
    dashboard: [
        {
            icon: LayoutDashboard,
            title: "Welcome to Prep St",
            description: "Your personalized SAT prep dashboard. Everything you need to crush your test is right here.",
        },
        {
            icon: Timer,
            title: "Quick Start Practice",
            description: "Hit 'Quick Start' to jump into a timed practice session — we'll pick questions based on your skill level.",
        },
        {
            icon: TrendingUp,
            title: "Track Your Progress",
            description: "Your study plan and performance insights update in real-time. Stay on track and watch your score grow!",
        },
    ],

    "study-plan": [
        {
            icon: CalendarCheck,
            title: "Your Personalized Study Plan",
            description: "We've created a custom schedule based on your goals and available time. Each session targets your weak areas.",
        },
        {
            icon: BookOpen,
            title: "Complete Sessions",
            description: "Work through each session in order. Mark them complete as you go — consistency is key!",
        },
        {
            icon: Sparkles,
            title: "Adapt & Improve",
            description: "Your plan updates automatically based on your performance. The more you practice, the smarter it gets.",
        },
    ],

    drill: [
        {
            icon: Target,
            title: "Unlimited Topic Drills",
            description: "Practice any concept as much as you need. No daily limits — master topics at your own pace.",
        },
        {
            icon: Brain,
            title: "Focus on Weak Spots",
            description: "Choose topics where you need the most practice. Each drill adapts to challenge you appropriately.",
        },
    ],

    analytics: [
        {
            icon: BarChart3,
            title: "Your Performance Dashboard",
            description: "See exactly where you stand. Track score trends, accuracy rates, and time per question.",
        },
        {
            icon: Search,
            title: "Identify Weak Areas",
            description: "Pinpoint which topics need the most attention so you can study smarter, not harder.",
        },
    ],

    "mock-exam": [
        {
            icon: ClipboardCheck,
            title: "Full SAT Simulation",
            description: "Experience the real test format. Complete mock exams with accurate timing and question distribution.",
        },
        {
            icon: BarChart3,
            title: "Detailed Score Reports",
            description: "After each exam, get a full breakdown of your performance with actionable insights.",
        },
    ],

    "question-pool": [
        {
            icon: Database,
            title: "Browse All Questions",
            description: "Explore our complete question bank. Filter by topic, difficulty, or question type.",
        },
        {
            icon: Bookmark,
            title: "Save for Later",
            description: "Bookmark questions you want to revisit. Build your own custom review sets.",
        },
    ],

    progress: [
        {
            icon: TrendingUp,
            title: "Track Your Journey",
            description: "See how far you've come! Your progress history shows every session and improvement.",
        },
    ],

    saved: [
        {
            icon: Bookmark,
            title: "Your Saved Questions",
            description: "All your bookmarked questions in one place. Perfect for targeted review sessions.",
        },
    ],

    revision: [
        {
            icon: RotateCcw,
            title: "Smart Review",
            description: "Revisit questions you got wrong. Our spaced repetition helps you actually remember.",
        },
    ],

    chat: [
        {
            icon: MessageCircle,
            title: "Meet Peppa AI",
            description: "Your 24/7 study companion! Ask any question and get instant, step-by-step explanations.",
        },
        {
            icon: MessagesSquare,
            title: "Ask Follow-ups",
            description: "Don't understand something? Keep asking! Peppa will explain it differently until it clicks.",
        },
    ],

    "my-sat": [
        {
            icon: Target,
            title: "Your SAT Profile",
            description: "Set your target score and test date. We'll tailor everything to help you reach your goals.",
        },
    ],

    vocab: [
        {
            icon: BookMarked,
            title: "SAT Vocabulary Builder",
            description: "Master essential words that appear on the test. Learn with context and spaced repetition.",
        },
    ],

    "mind-map": [
        {
            icon: Share2,
            title: "Visual Learning",
            description: "See how concepts connect. Mind maps help you understand the big picture.",
        },
    ],

    profile: [
        {
            icon: UserRound,
            title: "Your Profile",
            description: "View and update your account information, goals, and preferences.",
        },
    ],

    settings: [
        {
            icon: Settings,
            title: "Customize Your Experience",
            description: "Adjust themes, notifications, and study preferences. Reset your study plan if needed.",
        },
    ],
};
