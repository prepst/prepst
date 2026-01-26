"use client";

import { useState } from "react";
import { X, Sparkles, Zap, Brain, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PremiumUpgradeDialog } from "./PremiumUpgradeDialog";

interface PremiumPromoPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumPromoPopup({ isOpen, onClose }: PremiumPromoPopupProps) {
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

    const features = [
        {
            icon: Sparkles,
            title: "Peppa Sessions",
            description: "Special AI-powered practice sessions",
        },
        {
            icon: BarChart3,
            title: "Progress Analytics",
            description: "Granular data pathway insights",
        },
        {
            icon: Brain,
            title: "Unlimited AI Help",
            description: "Step-by-step Peppa assistance",
        },
        {
            icon: Target,
            title: "Unlimited Drilling",
            description: "Practice without limits",
        },
    ];

    const handleGetPremium = () => {
        onClose();
        setShowUpgradeDialog(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden border-primary/20">
                    {/* Header with gradient */}
                    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
                        <div className="absolute top-3 right-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-background/80"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">PrepSt+</h2>
                                <p className="text-sm text-muted-foreground">Premium Experience</p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Unlock the full potential of your SAT prep with exclusive features
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="p-6 pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <feature.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground leading-tight">
                                            {feature.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Section */}
                        <div className="pt-2 space-y-3">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-bold text-foreground">$14.99</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>

                            <Button
                                onClick={handleGetPremium}
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Get PrepSt+
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="w-full text-sm text-muted-foreground hover:text-foreground"
                            >
                                Maybe later
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <PremiumUpgradeDialog
                isOpen={showUpgradeDialog}
                onClose={() => setShowUpgradeDialog(false)}
            />
        </>
    );
}
