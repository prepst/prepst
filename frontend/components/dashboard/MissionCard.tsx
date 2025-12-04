"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
    Play, 
    Calendar, 
    Clock, 
    ArrowRight, 
    CheckCircle2,
    BookOpen,
    Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Session {
    id: string;
    topic_name: string;
    description?: string;
    scheduled_date: string;
    duration_minutes: number;
    status: string;
    num_questions: number;
}

interface MissionCardProps {
    session?: Session;
    isLoading?: boolean;
    onStart?: () => void;
}

export default function MissionCard({ session, isLoading, onStart }: MissionCardProps) {
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="w-full h-[300px] rounded-3xl bg-muted/20 animate-pulse" />
        );
    }

    if (!session) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 p-8 text-center"
            >
                <div className="flex flex-col items-center justify-center h-full min-h-[250px] gap-4">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-2 animate-bounce">
                        <Trophy className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">All Missions Complete!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        You've crushed all your scheduled sessions. Take a break or start a custom practice to keep the streak going.
                    </p>
                    <Button 
                        onClick={() => router.push("/onboard")}
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                    >
                        Create New Plan
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-2xl h-full"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-500" />

            <div className="relative p-8 md:p-10 flex flex-col h-full justify-center">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 ring-1 ring-inset ring-purple-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                Current Mission
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20">
                                <Clock className="w-3 h-3" />
                                {session.duration_minutes} min
                            </span>
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                                {session.topic_name}
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                {session.description || `Master ${session.topic_name} with ${session.num_questions} targeted practice questions designed to boost your score.`}
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <Button 
                            onClick={onStart}
                            className="w-full md:w-auto relative group/btn bg-foreground text-background hover:bg-foreground/90 px-8 py-8 rounded-2xl text-xl font-bold overflow-hidden transition-all hover:scale-105 shadow-xl"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Start Mission
                                <Play className="w-6 h-6 fill-current" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
                        </Button>
                    </div>
                </div>
            </div>
            
            {/* Progress Bar at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[0%]" />
            </div>
        </motion.div>
    );
}
