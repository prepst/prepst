"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calculator, BookOpen } from "lucide-react";
import { DesmosCalculator } from "./DesmosCalculator";
import { FormulaSheet } from "./FormulaSheet";

interface MockExamToolsToolbarProps {
    className?: string;
}

export function MockExamToolsToolbar({ className }: MockExamToolsToolbarProps) {
    const [showCalculator, setShowCalculator] = useState(false);
    const [showFormulas, setShowFormulas] = useState(false);

    return (
        <TooltipProvider>
            {/* Floating Toolbar - Compact for Mock Exam */}
            <div
                className={`
          flex items-center gap-1.5 px-2 py-1.5 
          rounded-full border border-border/50 
          bg-background/80 backdrop-blur-xl 
          shadow-lg
          ${className || ""}
        `}
            >
                {/* Scientific Calculator Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`
                h-9 w-9 rounded-full transition-all duration-200
                ${showCalculator
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }
              `}
                            onClick={() => setShowCalculator(!showCalculator)}
                        >
                            <Calculator className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        Calculator
                    </TooltipContent>
                </Tooltip>

                <div className="w-px h-5 bg-border/50" />

                {/* Formula Reference Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`
                h-9 w-9 rounded-full transition-all duration-200
                ${showFormulas
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }
              `}
                            onClick={() => setShowFormulas(!showFormulas)}
                        >
                            <BookOpen className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        Formula Reference
                    </TooltipContent>
                </Tooltip>
            </div>

            {/* Scientific Calculator Only (no graphing in mock exam) */}
            <DesmosCalculator
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
                calculatorType="scientific"
            />

            {/* Formula Sheet */}
            <FormulaSheet
                isOpen={showFormulas}
                onClose={() => setShowFormulas(false)}
            />
        </TooltipProvider>
    );
}
