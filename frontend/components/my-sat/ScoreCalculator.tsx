"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator, Info, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModuleScore {
    rw1: number;
    rw2: number;
    math1: number;
    math2: number;
}

// SAT Score conversion tables (simplified approximation)
// In reality, College Board uses equating which varies by test
const calculateScaledScore = (rawRW: number, rawMath: number) => {
    // RW: 0-54 raw → 200-800 scaled
    // Math: 0-44 raw → 200-800 scaled

    // Using a curve that rewards higher performance progressively
    const rwPercent = rawRW / 54;
    const mathPercent = rawMath / 44;

    // Apply a slight curve (higher scores harder to achieve)
    const rwCurve = Math.pow(rwPercent, 0.95);
    const mathCurve = Math.pow(mathPercent, 0.95);

    const rwScaled = Math.round(200 + rwCurve * 600);
    const mathScaled = Math.round(200 + mathCurve * 600);

    return {
        rw: Math.min(800, Math.max(200, rwScaled)),
        math: Math.min(800, Math.max(200, mathScaled)),
        total: Math.min(1600, Math.max(400, rwScaled + mathScaled)),
    };
};

const getScoreColor = (score: number, max: number) => {
    const percent = score / max;
    if (percent >= 0.9) return "text-emerald-600 dark:text-emerald-400";
    if (percent >= 0.75) return "text-blue-600 dark:text-blue-400";
    if (percent >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
};

const getScoreBgColor = (score: number, max: number) => {
    const percent = score / max;
    if (percent >= 0.9) return "from-emerald-500/20 to-emerald-500/5";
    if (percent >= 0.75) return "from-blue-500/20 to-blue-500/5";
    if (percent >= 0.6) return "from-amber-500/20 to-amber-500/5";
    return "from-muted/20 to-muted/5";
};

export function ScoreCalculator() {
    const [scores, setScores] = useState<ModuleScore>({
        rw1: 20,
        rw2: 24,
        math1: 15,
        math2: 18,
    });

    const [calculatedScore, setCalculatedScore] = useState({
        rw: 0,
        math: 0,
        total: 0,
    });

    const [previousTotal, setPreviousTotal] = useState(0);

    // Calculate scores whenever inputs change
    useEffect(() => {
        const rawRW = scores.rw1 + scores.rw2;
        const rawMath = scores.math1 + scores.math2;
        const newScores = calculateScaledScore(rawRW, rawMath);

        setPreviousTotal(calculatedScore.total);
        setCalculatedScore(newScores);
    }, [scores]);

    const ModuleSlider = ({
        label,
        value,
        max,
        onChange,
        section,
    }: {
        label: string;
        value: number;
        max: number;
        onChange: (value: number) => void;
        section: "rw" | "math";
    }) => (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            "font-mono text-sm tabular-nums",
                            section === "rw"
                                ? "border-rose-500/30 text-rose-600 dark:text-rose-400"
                                : "border-amber-500/30 text-amber-600 dark:text-amber-400"
                        )}
                    >
                        {value}/{max}
                    </Badge>
                </div>
            </div>
            <Slider
                value={[value]}
                max={max}
                step={1}
                onValueChange={([v]) => onChange(v)}
                className={cn(
                    "cursor-pointer",
                    section === "rw" ? "[&_[role=slider]]:bg-rose-500" : "[&_[role=slider]]:bg-amber-500"
                )}
            />
        </div>
    );

    return (
        <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            Score Calculator
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            See how raw scores convert to scaled SAT scores
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sliders Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Reading & Writing */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-rose-500" />
                                <h3 className="font-semibold text-foreground">
                                    Reading & Writing
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                    {scores.rw1 + scores.rw2}/54 raw
                                </Badge>
                            </div>

                            <div className="space-y-6 pl-4">
                                <ModuleSlider
                                    label="Module 1"
                                    value={scores.rw1}
                                    max={27}
                                    onChange={(v) => setScores((s) => ({ ...s, rw1: v }))}
                                    section="rw"
                                />
                                <ModuleSlider
                                    label="Module 2"
                                    value={scores.rw2}
                                    max={27}
                                    onChange={(v) => setScores((s) => ({ ...s, rw2: v }))}
                                    section="rw"
                                />
                            </div>
                        </div>

                        {/* Math */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                                <h3 className="font-semibold text-foreground">Math</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {scores.math1 + scores.math2}/44 raw
                                </Badge>
                            </div>

                            <div className="space-y-6 pl-4">
                                <ModuleSlider
                                    label="Module 1"
                                    value={scores.math1}
                                    max={22}
                                    onChange={(v) => setScores((s) => ({ ...s, math1: v }))}
                                    section="math"
                                />
                                <ModuleSlider
                                    label="Module 2"
                                    value={scores.math2}
                                    max={22}
                                    onChange={(v) => setScores((s) => ({ ...s, math2: v }))}
                                    section="math"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Adaptive Testing:</span>{" "}
                                Module 2 difficulty adjusts based on your Module 1 performance. This calculator provides an estimate.
                            </p>
                        </div>
                    </div>

                    {/* Score Display */}
                    <div className="space-y-4">
                        {/* Total Score */}
                        <motion.div
                            className={cn(
                                "p-6 rounded-2xl bg-gradient-to-br border border-border/50 text-center",
                                getScoreBgColor(calculatedScore.total, 1600)
                            )}
                            layout
                        >
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                Total Score
                            </p>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={calculatedScore.total}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 1.2, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "text-5xl font-bold tabular-nums",
                                        getScoreColor(calculatedScore.total, 1600)
                                    )}
                                >
                                    {calculatedScore.total}
                                </motion.div>
                            </AnimatePresence>
                            <p className="text-xs text-muted-foreground mt-1">400-1600</p>

                            {/* Score change indicator */}
                            {previousTotal !== 0 && previousTotal !== calculatedScore.total && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium",
                                        calculatedScore.total > previousTotal
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                    )}
                                >
                                    <TrendingUp
                                        className={cn(
                                            "w-3 h-3",
                                            calculatedScore.total < previousTotal && "rotate-180"
                                        )}
                                    />
                                    {calculatedScore.total > previousTotal ? "+" : ""}
                                    {calculatedScore.total - previousTotal}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Section Scores */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    R&W Score
                                </p>
                                <motion.p
                                    key={calculatedScore.rw}
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums"
                                >
                                    {calculatedScore.rw}
                                </motion.p>
                                <p className="text-xs text-muted-foreground">200-800</p>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Math Score
                                </p>
                                <motion.p
                                    key={calculatedScore.math}
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums"
                                >
                                    {calculatedScore.math}
                                </motion.p>
                                <p className="text-xs text-muted-foreground">200-800</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
