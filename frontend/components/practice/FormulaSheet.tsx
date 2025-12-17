"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Minus, GripHorizontal, BookOpen, GraduationCap } from "lucide-react";

interface FormulaSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

// Formula card component
function FormulaCard({
    title,
    formulas,
}: {
    title: string;
    formulas: { name: string; formula: string; note?: string }[];
}) {
    return (
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            <div className="px-3 py-2 bg-muted/30 border-b border-border/50">
                <h3 className="text-xs font-semibold text-foreground">{title}</h3>
            </div>
            <div className="p-3 space-y-2">
                {formulas.map((f, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {f.name}
                            </span>
                            <code className="text-xs font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                {f.formula}
                            </code>
                        </div>
                        {f.note && (
                            <span className="text-[9px] text-muted-foreground/80 italic">
                                {f.note}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FormulaSheet({ isOpen, onClose }: FormulaSheetProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Position and size state
    const [position, setPosition] = useState({ x: 150, y: 80 });
    const [size, setSize] = useState({ width: 580, height: 620 });

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Resizing state
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<string>("");
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

    // Dragging handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (panelRef.current) {
            const rect = panelRef.current.getBoundingClientRect();
            dragOffset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            setIsDragging(true);
        }
    }, []);

    // Resize handlers
    const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        e.preventDefault();
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height,
            posX: position.x,
            posY: position.y,
        };
        setResizeDirection(direction);
        setIsResizing(true);
    }, [size, position]);

    useEffect(() => {
        if (!isDragging && !isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y,
                });
            } else if (isResizing) {
                const deltaX = e.clientX - resizeStart.current.x;
                const deltaY = e.clientY - resizeStart.current.y;
                const minWidth = 400;
                const minHeight = 300;

                let newWidth = resizeStart.current.width;
                let newHeight = resizeStart.current.height;
                let newPosX = resizeStart.current.posX;
                let newPosY = resizeStart.current.posY;

                if (resizeDirection.includes("e")) {
                    newWidth = Math.max(minWidth, resizeStart.current.width + deltaX);
                }
                if (resizeDirection.includes("w")) {
                    const potentialWidth = resizeStart.current.width - deltaX;
                    if (potentialWidth >= minWidth) {
                        newWidth = potentialWidth;
                        newPosX = resizeStart.current.posX + deltaX;
                    }
                }
                if (resizeDirection.includes("s")) {
                    newHeight = Math.max(minHeight, resizeStart.current.height + deltaY);
                }
                if (resizeDirection.includes("n")) {
                    const potentialHeight = resizeStart.current.height - deltaY;
                    if (potentialHeight >= minHeight) {
                        newHeight = potentialHeight;
                        newPosY = resizeStart.current.posY + deltaY;
                    }
                }

                setSize({ width: newWidth, height: newHeight });
                setPosition({ x: newPosX, y: newPosY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeDirection("");
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, isResizing, resizeDirection]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className={`
        fixed z-50 flex flex-col
        rounded-2xl border border-border/50 
        bg-background/95 backdrop-blur-xl 
        shadow-2xl
        ${isDragging || isResizing ? "select-none" : ""}
      `}
            style={{
                left: position.x,
                top: position.y,
                width: size.width,
                height: isMinimized ? "auto" : size.height,
                maxHeight: "90vh",
            }}
        >
            {/* Resize Handles */}
            {!isMinimized && (
                <>
                    {/* Corners */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize z-10" onMouseDown={(e) => handleResizeStart(e, "nw")} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize z-10" onMouseDown={(e) => handleResizeStart(e, "ne")} />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize z-10" onMouseDown={(e) => handleResizeStart(e, "sw")} />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize z-10" onMouseDown={(e) => handleResizeStart(e, "se")} />
                    {/* Edges */}
                    <div className="absolute top-2 -left-1 bottom-2 w-2 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, "w")} />
                    <div className="absolute top-2 -right-1 bottom-2 w-2 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, "e")} />
                    <div className="absolute -top-1 left-2 right-2 h-2 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, "n")} />
                    <div className="absolute -bottom-1 left-2 right-2 h-2 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, "s")} />
                </>
            )}

            {/* Header - Draggable */}
            <div
                className={`
          flex items-center justify-between px-4 py-3 
          border-b border-border/50 
          rounded-t-2xl bg-muted/30
          ${isDragging ? "cursor-grabbing" : "cursor-grab"}
        `}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-foreground">
                            SAT Math Reference
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                            Official formulas provided on the SAT
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={onClose}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <ScrollArea className="flex-1 overflow-auto rounded-b-2xl">
                    <div className="p-4 space-y-4">
                        {/* Official SAT Reference Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge
                                    variant="outline"
                                    className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 text-[10px] py-0"
                                >
                                    <GraduationCap className="w-3 h-3 mr-1" />
                                    Official SAT Reference
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormulaCard
                                    title="Area Formulas"
                                    formulas={[
                                        { name: "Circle", formula: "A = πr²" },
                                        { name: "Rectangle", formula: "A = lw" },
                                        { name: "Triangle", formula: "A = ½bh" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Circle"
                                    formulas={[
                                        { name: "Circumference", formula: "C = 2πr" },
                                        { name: "Circumference", formula: "C = πd" },
                                        { name: "Area", formula: "A = πr²" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Right Triangle"
                                    formulas={[
                                        { name: "Pythagorean", formula: "a² + b² = c²" },
                                        { name: "30-60-90", formula: "x : x√3 : 2x" },
                                        { name: "45-45-90", formula: "x : x : x√2" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Volume Formulas"
                                    formulas={[
                                        { name: "Box/Prism", formula: "V = lwh" },
                                        { name: "Cylinder", formula: "V = πr²h" },
                                        { name: "Sphere", formula: "V = (4/3)πr³" },
                                        { name: "Cone", formula: "V = (1/3)πr²h" },
                                    ]}
                                />
                            </div>
                        </div>

                        <Separator className="my-3" />

                        {/* Study Reference Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge
                                    variant="outline"
                                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] py-0"
                                >
                                    Study Reference
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                    Memorize these
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormulaCard
                                    title="Linear Equations"
                                    formulas={[
                                        { name: "Slope", formula: "m = (y₂-y₁)/(x₂-x₁)" },
                                        { name: "Slope-Intercept", formula: "y = mx + b" },
                                        { name: "Point-Slope", formula: "y - y₁ = m(x - x₁)" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Quadratics"
                                    formulas={[
                                        { name: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac))/2a" },
                                        { name: "Discriminant", formula: "b² - 4ac" },
                                        { name: "Vertex", formula: "x = -b/2a" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Coordinate Geometry"
                                    formulas={[
                                        { name: "Distance", formula: "d = √((x₂-x₁)² + (y₂-y₁)²)" },
                                        { name: "Midpoint", formula: "((x₁+x₂)/2, (y₁+y₂)/2)" },
                                        { name: "Circle", formula: "(x-h)² + (y-k)² = r²" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Trigonometry"
                                    formulas={[
                                        { name: "Sine", formula: "sin = opp/hyp" },
                                        { name: "Cosine", formula: "cos = adj/hyp" },
                                        { name: "Tangent", formula: "tan = opp/adj" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Exponents"
                                    formulas={[
                                        { name: "Growth/Decay", formula: "y = a(1 ± r)ᵗ" },
                                        { name: "Product Rule", formula: "aᵐ · aⁿ = aᵐ⁺ⁿ" },
                                        { name: "Power Rule", formula: "(aᵐ)ⁿ = aᵐⁿ" },
                                    ]}
                                />

                                <FormulaCard
                                    title="Statistics"
                                    formulas={[
                                        { name: "Mean", formula: "Σx / n" },
                                        { name: "% Change", formula: "(new-old)/old × 100" },
                                        { name: "Probability", formula: "P = favorable/total" },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                            <p className="text-[10px] text-muted-foreground">
                                <strong>Note:</strong> Circle = 360° = 2π radians. Triangle angles sum to 180°.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
