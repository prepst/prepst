"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// SAT Score conversion (simplified approximation)
const calculateScaledScore = (rawRW: number, rawMath: number) => {
    const rwPercent = rawRW / 54;
    const mathPercent = rawMath / 44;

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

interface ModuleSliderProps {
    label: string;
    value: number;
    max: number;
    onChange: (value: number) => void;
}

function ModuleSlider({ label, value, max, onChange }: ModuleSliderProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <Slider
                        value={[value]}
                        max={max}
                        step={1}
                        onValueChange={([v]) => onChange(v)}
                        className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-border [&_[role=slider]]:bg-background [&_[role=slider]]:shadow-sm [&_.relative]:h-2 [&_[data-orientation=horizontal]]:h-2"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            onChange(Math.min(max, Math.max(0, v)));
                        }}
                        className="w-14 h-9 text-center font-medium tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min={0}
                        max={max}
                    />
                    <span className="text-sm text-muted-foreground">/{max}</span>
                </div>
            </div>
        </div>
    );
}

export function ScoreCalculator() {
    const [rw1, setRw1] = useState(20);
    const [rw2, setRw2] = useState(24);
    const [math1, setMath1] = useState(15);
    const [math2, setMath2] = useState(16);

    const score = useMemo(() => {
        const rawRW = rw1 + rw2;
        const rawMath = math1 + math2;
        return calculateScaledScore(rawRW, rawMath);
    }, [rw1, rw2, math1, math2]);

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden h-full">
            {/* Header */}
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                        <Calculator className="w-5 h-5 text-foreground" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                        Digital SAT® Score Calculator
                    </h2>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Sliders Section */}
                    <div className="lg:col-span-3 space-y-6">
                        <ModuleSlider
                            label="Reading and Writing Module 1"
                            value={rw1}
                            max={27}
                            onChange={setRw1}
                        />
                        <ModuleSlider
                            label="Reading and Writing Module 2"
                            value={rw2}
                            max={27}
                            onChange={setRw2}
                        />
                        <ModuleSlider
                            label="Math Module 1"
                            value={math1}
                            max={22}
                            onChange={setMath1}
                        />
                        <ModuleSlider
                            label="Math Module 2"
                            value={math2}
                            max={22}
                            onChange={setMath2}
                        />
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-2">
                        <div className="border border-border rounded-xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-center text-foreground">Results</h3>

                            {/* Total Score */}
                            <div className="text-center pb-4 border-b border-border">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Total Score</p>
                                <p className="text-6xl font-bold text-foreground tabular-nums">{score.total}</p>
                                <p className="text-sm text-muted-foreground mt-1">400-1600</p>
                            </div>

                            {/* Section Scores */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Reading & Writing Score</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-foreground tabular-nums">{score.rw}</span>
                                        <p className="text-xs text-muted-foreground">200 to 800</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Math Score</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-foreground tabular-nums">{score.math}</span>
                                        <p className="text-xs text-muted-foreground">200 to 800</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
