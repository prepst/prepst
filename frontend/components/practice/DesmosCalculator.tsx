"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Minus, GripHorizontal } from "lucide-react";

// Desmos type declarations
declare global {
    interface Window {
        Desmos: {
            GraphingCalculator: (el: HTMLElement, options?: object) => DesmosCalculator;
            ScientificCalculator: (el: HTMLElement, options?: object) => DesmosCalculator;
        };
    }
}

interface DesmosCalculator {
    destroy: () => void;
    resize: () => void;
}

interface DesmosCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    calculatorType: "scientific" | "graphing";
}

export function DesmosCalculator({ isOpen, onClose, calculatorType }: DesmosCalculatorProps) {
    const calculatorRef = useRef<HTMLDivElement>(null);
    const calculatorInstanceRef = useRef<DesmosCalculator | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const [isMinimized, setIsMinimized] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Position and size state
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({
        width: calculatorType === "graphing" ? 700 : 420,
        height: calculatorType === "graphing" ? 550 : 480
    });

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Resizing state
    const [isResizing, setIsResizing] = useState(false);
    const [resizeDirection, setResizeDirection] = useState<string>("");
    const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

    // Load Desmos API script once
    useEffect(() => {
        if (typeof window !== "undefined" && !window.Desmos) {
            const script = document.createElement("script");
            script.src = "https://www.desmos.com/api/v1.10/calculator.js?apiKey=9f6534c7b1b24fbd90a8430ba1a7e95d";
            script.async = true;
            script.onload = () => setIsScriptLoaded(true);
            document.head.appendChild(script);
        } else if (window.Desmos) {
            setIsScriptLoaded(true);
        }
    }, []);

    // Initialize calculator only once when first opened
    useEffect(() => {
        if (!isOpen || !isScriptLoaded || !calculatorRef.current || hasInitialized) return;

        const options = {
            settingsMenu: false,
            zoomButtons: calculatorType === "graphing",
            expressionsTopbar: calculatorType === "graphing",
            border: false,
        };

        try {
            if (calculatorType === "scientific") {
                calculatorInstanceRef.current = window.Desmos.ScientificCalculator(
                    calculatorRef.current,
                    options
                );
            } else {
                calculatorInstanceRef.current = window.Desmos.GraphingCalculator(
                    calculatorRef.current,
                    options
                );
            }
            setHasInitialized(true);
        } catch (error) {
            console.error("Failed to initialize Desmos calculator:", error);
        }
    }, [isOpen, isScriptLoaded, calculatorType, hasInitialized]);

    // Handle resize when size or minimized state changes
    useEffect(() => {
        if (calculatorInstanceRef.current && !isMinimized) {
            setTimeout(() => {
                calculatorInstanceRef.current?.resize();
            }, 50);
        }
    }, [isMinimized, size]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (calculatorInstanceRef.current) {
                calculatorInstanceRef.current.destroy();
                calculatorInstanceRef.current = null;
            }
        };
    }, []);

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
                const minWidth = 320;
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
                    <span className="text-sm font-semibold text-foreground">
                        {calculatorType === "scientific" ? "Scientific Calculator" : "Graphing Calculator"}
                    </span>
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

            {/* Calculator Container */}
            {!isMinimized && (
                <div className="flex-1 overflow-hidden rounded-b-2xl bg-white">
                    {!isScriptLoaded ? (
                        <div className="flex items-center justify-center h-full bg-muted/20">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm">Loading calculator...</span>
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={calculatorRef}
                            className="w-full h-full"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
