"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingStep } from "@/lib/onboardingContent";

interface OnboardingModalProps {
    pageId: string;
    steps: OnboardingStep[];
}

export function OnboardingModal({ pageId, steps }: OnboardingModalProps) {
    const { isPageCompleted, markPageComplete } = useOnboarding();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Small delay to prevent flash on navigation
        const timer = setTimeout(() => {
            if (!isPageCompleted(pageId)) {
                setIsOpen(true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [pageId, isPageCompleted]);

    const handleComplete = () => {
        markPageComplete(pageId);
        setIsOpen(false);
        setCurrentStep(0);
    };

    const handleSkip = () => {
        markPageComplete(pageId);
        setIsOpen(false);
        setCurrentStep(0);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!steps || steps.length === 0) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-primary/20 bg-card">
                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Close onboarding"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Illustration Area */}
                <div className="relative h-56 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent flex items-center justify-center overflow-hidden">
                    {/* Decorative blurs */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-3xl" />

                    {/* Illustration */}
                    {typeof step.illustration === "string" ? (
                        <Image
                            src={step.illustration}
                            alt={step.title}
                            width={160}
                            height={160}
                            className="relative z-10 drop-shadow-lg"
                        />
                    ) : (
                        <div className="relative z-10">{step.illustration}</div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-6 pt-5 space-y-6">
                    {/* Step indicators */}
                    {steps.length > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            {steps.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`h-2 rounded-full transition-all duration-200 ${index === currentStep
                                        ? "w-6 bg-primary"
                                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                        }`}
                                    aria-label={`Go to step ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Text content */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">
                            {step.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        {!isFirstStep && (
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                className="flex-1 h-12 font-medium"
                            >
                                Previous
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            className="h-12 font-semibold flex-1 hover:opacity-90 transition-opacity text-base"
                            style={{ backgroundColor: "#dad3fd", color: "#5b3cc4" }}
                        >
                            {isLastStep ? "Get Started" : "Continue"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
