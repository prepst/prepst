"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calculator, BookOpen, FunctionSquare } from "lucide-react";
import { DesmosCalculator } from "./DesmosCalculator";
import { FormulaSheet } from "./FormulaSheet";

interface SATToolsToolbarProps {
    className?: string;
}

export function SATToolsToolbar({ className }: SATToolsToolbarProps) {
    // Separate state for each calculator type
    const [showScientific, setShowScientific] = useState(false);
    const [showGraphing, setShowGraphing] = useState(false);
    const [showFormulas, setShowFormulas] = useState(false);

    return (
        <TooltipProvider>
            {/* Floating Toolbar */}
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
                ${showScientific
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }
              `}
                            onClick={() => setShowScientific(!showScientific)}
                        >
                            <Calculator className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        Scientific Calculator
                    </TooltipContent>
                </Tooltip>

                {/* Graphing Calculator Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`
                h-9 w-9 rounded-full transition-all duration-200
                ${showGraphing
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }
              `}
                            onClick={() => setShowGraphing(!showGraphing)}
                        >
                            <FunctionSquare className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        Graphing Calculator
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

            {/* Calculators - Separate instances that persist */}
            <DesmosCalculator
                isOpen={showScientific}
                onClose={() => setShowScientific(false)}
                calculatorType="scientific"
            />
            <DesmosCalculator
                isOpen={showGraphing}
                onClose={() => setShowGraphing(false)}
                calculatorType="graphing"
            />

            {/* Formula Sheet - Using Dialog is fine since it's reference material */}
            <FormulaSheet
                isOpen={showFormulas}
                onClose={() => setShowFormulas(false)}
            />
        </TooltipProvider>
    );
}
