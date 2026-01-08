"use client";

import { useState, useEffect } from "react";
import { Calendar, Edit3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

interface TestDateCountdownProps {
    testDate: Date | null;
    onEditClick?: () => void;
}

const motivationalMessages = [
    "Every practice session brings you closer to your goal! 💪",
    "You've got this! Consistency is key. 🔑",
    "Small steps lead to big achievements. 🚀",
    "Your future self will thank you for studying today. ⭐",
    "Stay focused, stay determined. You're doing great! 🎯",
    "The best time to practice was yesterday. The next best time is now. ⏰",
];

export function TestDateCountdown({ testDate, onEditClick }: TestDateCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [motivationalIndex, setMotivationalIndex] = useState(0);

    useEffect(() => {
        if (!testDate) return;

        const updateCountdown = () => {
            const now = new Date();
            const target = new Date(testDate);

            if (target <= now) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            // Calculate total time differences
            const totalSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);
            const days = Math.floor(totalSeconds / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [testDate]);

    // Rotate motivational messages
    useEffect(() => {
        const interval = setInterval(() => {
            setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <motion.div
                key={value}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative"
            >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
                        {value.toString().padStart(2, "0")}
                    </span>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            </motion.div>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground mt-2 uppercase tracking-wider">
                {label}
            </span>
        </div>
    );

    if (!testDate) {
        return (
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20 shadow-sm">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Test Date</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Set Your SAT Date</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Tell us when you're taking the SAT so we can help you prepare with a personalized timeline.
                    </p>
                    <Button
                        onClick={onEditClick}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Set Test Date
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20 shadow-sm overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                            Your SAT is in
                        </span>
                    </div>
                </div>

                {/* Countdown */}
                <div className="flex justify-center gap-3 sm:gap-6 mb-8">
                    <TimeBlock value={timeLeft.days} label="Days" />
                    <div className="flex items-center text-2xl font-bold text-muted-foreground/50">:</div>
                    <TimeBlock value={timeLeft.hours} label="Hours" />
                    <div className="flex items-center text-2xl font-bold text-muted-foreground/50">:</div>
                    <TimeBlock value={timeLeft.minutes} label="Mins" />
                    <div className="flex items-center text-2xl font-bold text-muted-foreground/50">:</div>
                    <TimeBlock value={timeLeft.seconds} label="Secs" />
                </div>

                {/* Test Date & Edit */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full border border-border/50">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                            {format(new Date(testDate), "MMMM d, yyyy")}
                        </span>
                    </div>
                    {onEditClick && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onEditClick}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Date
                        </Button>
                    )}
                </div>

                {/* Motivational Message */}
                <motion.div
                    key={motivationalIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center"
                >
                    <p className="text-muted-foreground italic">
                        {motivationalMessages[motivationalIndex]}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
