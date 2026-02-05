"use client";

import { useState } from "react";
import { X, Check, Sparkles, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PremiumUpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const STRIPE_PAYMENT_LINKS = {
  week:
    process.env.NEXT_PUBLIC_STRIPE_PREMIUM_WEEK_LINK ||
    "https://buy.stripe.com/test_week",
  month:
    process.env.NEXT_PUBLIC_STRIPE_PREMIUM_LINK ||
    "https://buy.stripe.com/test_month",
  sixMonth:
    process.env.NEXT_PUBLIC_STRIPE_PREMIUM_6MONTH_LINK ||
    "https://buy.stripe.com/test_6month",
};

type PlanType = "week" | "month" | "sixMonth";

interface PricingPlan {
  id: PlanType;
  name: string;
  duration: string;
  price: number;
  perDay: string;
  total?: string;
  savings?: string;
  popular?: boolean;
}

export function PremiumUpgradeDialog({
  isOpen,
  onClose,
}: PremiumUpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("month");

  const plans: PricingPlan[] = [
    {
      id: "week",
      name: "1 Week",
      duration: "week",
      price: 4.99,
      perDay: "$0.71/day",
      total: "$4.99/month",
    },
    {
      id: "month",
      name: "1 Month",
      duration: "month",
      price: 14.99,
      perDay: "$0.50/day",
      total: "$14.99/month",
      popular: true,
    },
    {
      id: "sixMonth",
      name: "6 Months",
      duration: "6 months",
      price: 59.99,
      perDay: "$0.33/day",
      total: "$59.99/month",
      savings: "Save 33%",
    },
  ];

  const freeFeatures = [
    "Basic Practice Sessions",
    "Study Plan Access",
    "Question Pool",
    "1 Diagnostic Test",
    "Basic Progress Tracking",
  ];

  const premiumFeatures = [
    {
      title: "Everything in Free",
      description: null,
    },
    {
      title: "Peppa Sessions",
      description: "AI-powered special practice with personalized feedback",
    },
    {
      title: "Progress Analytics",
      description: "Granular data pathway with detailed performance insights",
    },
    {
      title: "Unlimited Peppa AI",
      description: "Step-by-step explanations and help anytime",
    },
    {
      title: "Unlimited Drilling",
      description: "Practice specific topics without any limits",
    },
  ];

  const handleSubscribe = () => {
    window.open(STRIPE_PAYMENT_LINKS[selectedPlan], "_blank");
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan)!;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 gap-0 overflow-hidden max-h-[90vh] border-0 flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden bg-background px-6 pt-3 pb-0 shrink-0">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <h2 className="text-2xl font-bold text-foreground whitespace-nowrap">
                PrepSt+ users score{" "}
                <span className="text-[#9184ff]">400+ points higher</span>
              </h2>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 bg-background">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Free
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essential tools to start your SAT prep journey. Free
                    forever.
                  </p>
                </div>

                <ul className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium Plan - More colorful */}
              <div className="relative rounded-2xl border-2 border-[#9184ff] overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#9184ff]/10 via-purple-500/5 to-blue-500/10"></div>

                {/* Popular Badge */}
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-0">
                  <div className="bg-gradient-to-r from-[#9184ff] to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl flex items-center gap-1.5 shadow-lg">
                    <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                    Most Popular
                  </div>
                </div>

                <div className="relative z-10 p-6 pt-10">
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#9184ff]" />
                      <h3 className="text-lg font-bold text-[#9184ff]">
                        PrepSt+
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our full suite of AI features to maximize your SAT score.
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {premiumFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#9184ff] to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {feature.title}
                          </span>
                          {feature.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? "bg-gradient-to-br from-[#9184ff]/15 to-purple-500/10 border-2 border-[#9184ff] shadow-lg"
                      : "bg-card border border-border hover:border-[#9184ff]/50"
                  }`}
                >
                  {plan.savings && (
                    <div className="absolute -top-2 right-3">
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {plan.savings}
                      </span>
                    </div>
                  )}
                  {plan.popular && (
                    <div className="absolute -top-2 right-3">
                      <span className="bg-[#9184ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}
                  {plan.id === "sixMonth" && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">
                          Our Most Popular Plan
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mb-2">
                    <span
                      className={`text-sm font-semibold ${
                        selectedPlan === plan.id
                          ? "text-[#9184ff]"
                          : "text-foreground"
                      }`}
                    >
                      {plan.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      of PrepSt+
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      ${plan.price}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {plan.perDay}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {plan.total}
                  </div>
                </button>
              ))}
            </div>

            {/* Social Proof */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-[#9184ff]/30 to-purple-500/20 border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-[#9184ff]">
                      {String.fromCharCode(64 + i)}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Join <span className="font-bold text-foreground">1,000+</span>{" "}
                students already using PrepSt+
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-background border-t border-border shrink-0 px-6 py-[10px]">
          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubscribe}
              size="lg"
              className="h-12 px-8 text-base font-bold bg-gradient-to-r from-[#9184ff] via-[#7c6ff5] to-[#6b5ce7] text-white hover:opacity-90 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Zap className="h-5 w-5 mr-2" />
              Get PrepSt+
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
