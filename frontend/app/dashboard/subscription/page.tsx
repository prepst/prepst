"use client";

import { useState } from "react";
import Image from "next/image";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Sparkles,
  Shield,
  Clock,
  Gift,
} from "lucide-react";

// Floating pig decoration component
interface FloatingPigProps {
  src: string;
  className: string;
  size?: number;
  delay?: number;
}

function FloatingPig({ src, className, size = 80 }: FloatingPigProps) {
  return (
    <div className={`absolute pointer-events-none select-none z-10 ${className}`}>
      <Image
        src={src}
        alt="Cute pig mascot"
        width={size}
        height={size}
        className="drop-shadow-lg"
      />
    </div>
  );
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
  total: string;
  savings?: string;
  popular?: boolean;
}

function PremiumPageContent() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("month");
  const [isLoading, setIsLoading] = useState(false);

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
      total: "$59.99 total",
      savings: "Save 33%",
    },
  ];

  const features = [
    {
      image: "/icon-sessions.png",
      title: "Peppa Sessions",
      description:
        "Personalized 20-minute sessions that adapt to your skill level in real-time",
      color: "from-purple-500 to-pink-500",
      stats: "800+ questions",
    },
    {
      image: "/icon-analytics.png",
      title: "Progress Analytics",
      description:
        "Track your score trajectory and identify weak spots before test day",
      color: "from-blue-500 to-cyan-500",
      stats: "Topic-by-topic",
    },
    {
      image: "/icon-ai-help.png",
      title: "Unlimited Peppa AI",
      description:
        "Get instant explanations for any question — ask unlimited follow-ups",
      color: "from-green-500 to-emerald-500",
      stats: "24/7 help",
    },
    {
      image: "/icon-drilling.png",
      title: "Unlimited Drilling",
      description:
        "Master any concept with focused topic drills — no daily limits",
      color: "from-orange-500 to-amber-500",
      stats: "All topics",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      score: "+120 points",
      text: "PrepSt+ helped me focus on my weak areas. The AI explanations are amazing!",
    },
    {
      name: "Jason K.",
      score: "+90 points",
      text: "The unlimited drilling feature was a game-changer for my math section.",
    },
    {
      name: "Emily R.",
      score: "+150 points",
      text: "I went from 1280 to 1430 in just 2 months with PrepSt+.",
    },
  ];

  const handleSubscribe = () => {
    setIsLoading(true);
    window.open(STRIPE_PAYMENT_LINKS[selectedPlan], "_blank");
    setTimeout(() => setIsLoading(false), 1000);
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan)!;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating Pigs - All 8 cute decorative elements */}
      <FloatingPig
        src="/pig1.png"
        className="top-20 left-[5%] hidden md:block"
        size={120}
      />
      <FloatingPig
        src="/pig2.png"
        className="top-28 right-[6%] hidden md:block"
        size={110}
      />
      <FloatingPig
        src="/pig4.png"
        className="top-[380px] right-[4%] hidden lg:block"
        size={100}
      />
      <FloatingPig
        src="/pig5.png"
        className="top-[550px] left-[4%] hidden lg:block"
        size={110}
      />
      <FloatingPig
        src="/pig6.png"
        className="top-[620px] right-[3%] hidden lg:block"
        size={105}
      />
      <FloatingPig
        src="/pig7.png"
        className="bottom-[280px] left-[6%] hidden xl:block"
        size={115}
      />
      <FloatingPig
        src="/pig8.png"
        className="bottom-[200px] right-[5%] hidden xl:block"
        size={110}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-12 relative z-20">
        {/* March SAT Campaign Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/15 via-primary/15 to-amber-500/15 border border-emerald-500/30 backdrop-blur-sm mb-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Gift className="h-7 w-7 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Limited Time
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400">FREE</span> until March 14th!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Access all premium features at no cost until the next SAT test day
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10">
            <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
            Premium
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Unlock Your Full Potential with{" "}
            <span className="text-primary">PrepSt+</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who improved their SAT scores with our premium features.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 shadow-lg bg-white">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    {feature.stats && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {feature.stats}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="max-w-3xl mx-auto mb-16">
          {/* Pricing Options */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl p-5 text-center transition-all duration-200 ${selectedPlan === plan.id
                  ? "bg-gradient-to-br from-[#9184ff]/15 to-purple-500/10 border-2 border-[#9184ff] shadow-lg scale-105"
                  : "bg-card border border-border hover:border-[#9184ff]/50"
                  }`}
              >
                {plan.savings && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.savings}
                    </span>
                  </div>
                )}
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-[#9184ff] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}
                <div className="mb-2 mt-2">
                  <span
                    className={`font-bold ${selectedPlan === plan.id ? "text-[#9184ff]" : "text-foreground"}`}
                  >
                    {plan.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {plan.perDay}
                </div>
              </button>
            ))}
          </div>

          {/* Pricing Card - Vibrant colorful design */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#9184ff] via-[#7c6ff5] to-[#6b5ce7]"></div>

            {/* Abstract blur effects */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-purple-300/25 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-300/25 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>
              <div className="absolute top-1/2 left-1/2 w-[150px] h-[150px] bg-pink-300/15 rounded-full blur-[40px] -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="relative z-10 p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">
                      PrepSt+
                    </span>
                  </div>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2">
                    <span className="text-5xl font-bold text-white">
                      ${selectedPlanData.price}
                    </span>
                    <span className="text-white/70">
                      for {selectedPlanData.duration}
                    </span>
                  </div>
                  <p className="text-white/80 mt-2">
                    Cancel anytime. No hidden fees.
                  </p>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  size="lg"
                  className="h-14 px-10 text-lg font-bold bg-white text-[#9184ff] hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2 text-white/80">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Instant Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Students Love PrepSt+
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      {testimonial.score}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can cancel your subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground text-sm">
                We accept all major credit cards, debit cards, and Apple Pay
                through our secure Stripe payment system.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-2">
                Do I get a refund if I'm not satisfied?
              </h3>
              <p className="text-muted-foreground text-sm">
                We offer a 7-day money-back guarantee. If you're not satisfied,
                contact us within 7 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <ProtectedRoute>
      <PremiumPageContent />
    </ProtectedRoute>
  );
}
