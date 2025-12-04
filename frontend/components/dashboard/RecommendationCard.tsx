"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
    Zap, 
    TrendingUp,
    Target,
    ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

interface RecommendationCardProps {
    onStart?: () => void;
}

export default function RecommendationCard({ onStart }: RecommendationCardProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-xl h-full"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-500" />

            <div className="relative p-6 md:p-8 flex flex-col h-full justify-center">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 ring-1 ring-inset ring-orange-500/20">
                            <Zap className="w-3 h-3" />
                            Quick Win
                        </span>
                        <span className="text-xs text-muted-foreground">
                            ~5 min
                        </span>
                    </div>

                    <div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight mb-1">
                            Algebra Fundamentals
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your mastery is at 45%. Boost it with a quick drill.
                        </p>
                    </div>

                    <Button 
                        onClick={onStart}
                        variant="outline"
                        className="w-full mt-2 justify-between group/btn border-orange-500/20 hover:bg-orange-500/5 hover:border-orange-500/30 text-orange-600 dark:text-orange-400"
                    >
                        <span className="font-semibold">Start Drill</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
