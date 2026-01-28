import { ReactNode } from "react";

export interface OnboardingStep {
    illustration?: ReactNode | string;
    title: string;
    description: string;
}

export const ONBOARDING_CONTENT: Record<string, OnboardingStep[]> = {
    dashboard: [
        {
            illustration: "/pig1.png",
            title: "Welcome to PrepSt!",
            description: "Your personalized SAT prep dashboard. Everything you need to crush your test is right here.",
        },
        {
            illustration: "/pig2.png",
            title: "Quick Start Practice",
            description: "Hit 'Quick Start' to jump into a timed practice session — we'll pick questions based on your skill level.",
        },
        {
            illustration: "/pig4.png",
            title: "Track Your Progress",
            description: "Your study plan and performance insights update in real-time. Stay on track and watch your score grow!",
        },
    ],

    "study-plan": [
        {
            illustration: "/pig5.png",
            title: "Your Personalized Study Plan",
            description: "We've created a custom schedule based on your goals and available time. Each session targets your weak areas.",
        },
        {
            illustration: "/pig6.png",
            title: "Complete Sessions",
            description: "Work through each session in order. Mark them complete as you go — consistency is key!",
        },
        {
            illustration: "/pig8.png",
            title: "Adapt & Improve",
            description: "Your plan updates automatically based on your performance. The more you practice, the smarter it gets.",
        },
    ],

    drill: [
        {
            illustration: "/pig1.png",
            title: "Unlimited Topic Drills",
            description: "Practice any concept as much as you need. No daily limits — master topics at your own pace.",
        },
        {
            illustration: "/pig2.png",
            title: "Focus on Weak Spots",
            description: "Choose topics where you need the most practice. Each drill adapts to challenge you appropriately.",
        },
    ],

    analytics: [
        {
            illustration: "/pig4.png",
            title: "Your Performance Dashboard",
            description: "See exactly where you stand. Track score trends, accuracy rates, and time per question.",
        },
        {
            illustration: "/pig5.png",
            title: "Identify Weak Areas",
            description: "Pinpoint which topics need the most attention so you can study smarter, not harder.",
        },
    ],

    "mock-exam": [
        {
            illustration: "/pig6.png",
            title: "Full SAT Simulation",
            description: "Experience the real test format. Complete mock exams with accurate timing and question distribution.",
        },
        {
            illustration: "/pig8.png",
            title: "Detailed Score Reports",
            description: "After each exam, get a full breakdown of your performance with actionable insights.",
        },
    ],

    subscription: [
        {
            illustration: "/pig1.png",
            title: "PrepSt+ Premium",
            description: "Unlock unlimited AI help, advanced analytics, and personalized Peppa Sessions.",
        },
        {
            illustration: "/pig2.png",
            title: "Free Until March 14th!",
            description: "Try all premium features at no cost until the next SAT test day. No credit card required.",
        },
    ],

    "question-pool": [
        {
            illustration: "/pig4.png",
            title: "Browse All Questions",
            description: "Explore our complete question bank. Filter by topic, difficulty, or question type.",
        },
        {
            illustration: "/pig5.png",
            title: "Save for Later",
            description: "Bookmark questions you want to revisit. Build your own custom review sets.",
        },
    ],

    progress: [
        {
            illustration: "/pig6.png",
            title: "Track Your Journey",
            description: "See how far you've come! Your progress history shows every session and improvement.",
        },
    ],

    saved: [
        {
            illustration: "/pig8.png",
            title: "Your Saved Questions",
            description: "All your bookmarked questions in one place. Perfect for targeted review sessions.",
        },
    ],

    revision: [
        {
            illustration: "/pig1.png",
            title: "Smart Review",
            description: "Revisit questions you got wrong. Our spaced repetition helps you actually remember.",
        },
    ],

    chat: [
        {
            illustration: "/pig2.png",
            title: "Meet Peppa AI",
            description: "Your 24/7 study companion! Ask any question and get instant, step-by-step explanations.",
        },
        {
            illustration: "/pig4.png",
            title: "Ask Follow-ups",
            description: "Don't understand something? Keep asking! Peppa will explain it differently until it clicks.",
        },
    ],

    "my-sat": [
        {
            illustration: "/pig5.png",
            title: "Your SAT Profile",
            description: "Set your target score and test date. We'll tailor everything to help you reach your goals.",
        },
    ],

    vocab: [
        {
            illustration: "/pig6.png",
            title: "SAT Vocabulary Builder",
            description: "Master essential words that appear on the test. Learn with context and spaced repetition.",
        },
    ],

    "mind-map": [
        {
            illustration: "/pig8.png",
            title: "Visual Learning",
            description: "See how concepts connect. Mind maps help you understand the big picture.",
        },
    ],

    profile: [
        {
            illustration: "/pig1.png",
            title: "Your Profile",
            description: "View and update your account information, goals, and preferences.",
        },
    ],

    settings: [
        {
            illustration: "/pig2.png",
            title: "Customize Your Experience",
            description: "Adjust themes, notifications, and study preferences. Reset your study plan if needed.",
        },
    ],
};
