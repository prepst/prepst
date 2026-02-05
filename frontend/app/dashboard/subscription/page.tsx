"use client";

import { useState, useEffect } from "react";
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
  Check,
  X,
  Star,
  Users,
  TrendingUp,
  Crown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Infinity,
  BrainCircuit,
  BarChart3,
  MessageSquare,
  Target,
} from "lucide-react";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ONBOARDING_CONTENT } from "@/lib/onboardingContent";

// Floating pig decoration component
interface FloatingPigProps {
  src: string;
  className: string;
  size?: number;
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
  week: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_WEEK_LINK || "https://buy.stripe.com/test_week",
  month: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_LINK || "https://buy.stripe.com/test_month",
  sixMonth: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_6MONTH_LINK || "https://buy.stripe.com/test_6month",
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
  badge?: string;
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

function PremiumPageContent() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("month");
  const [isLoading, setIsLoading] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Animated counters for social proof
  const userCount = useAnimatedCounter(12500);
  const avgImprovement = useAnimatedCounter(127);

  // Show sticky CTA after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plans: PricingPlan[] = [
    {
      id: "week",
      name: "1 Week",
      duration: "week",
      price: 4.99,
      perDay: "$0.71/day",
      total: "$4.99 total",
      badge: "Trial",
    },
    {
      id: "month",
      name: "1 Month",
      duration: "month",
      price: 14.99,
      perDay: "$0.50/day",
      total: "$14.99/month",
      popular: true,
      badge: "Popular",
    },
    {
      id: "sixMonth",
      name: "6 Months",
      duration: "6 months",
      price: 59.99,
      perDay: "$0.33/day",
      total: "$59.99 total",
      savings: "Save 33%",
      badge: "Best Value",
    },
  ];

  const premiumFeatures = [
    {
      icon: BrainCircuit,
      title: "AI-Powered Study Plan",
      description: "Personalized 20-minute sessions that adapt to your skill level in real-time using advanced AI",
      stat: "800+ questions",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track your score trajectory, identify weak spots, and monitor progress with detailed insights",
      stat: "Topic mastery",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: MessageSquare,
      title: "Unlimited AI Tutor",
      description: "Get instant explanations for any question with unlimited follow-ups — like having a tutor 24/7",
      stat: "24/7 available",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Target,
      title: "Unlimited Practice",
      description: "Master any concept with focused topic drills — no daily limits, practice as much as you want",
      stat: "All topics",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Infinity,
      title: "Mock Exams",
      description: "Full-length SAT practice tests with detailed performance analysis and timing insights",
      stat: "Full tests",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-500/10",
    },
    {
      icon: Crown,
      title: "Priority Support",
      description: "Get help when you need it with priority access to our support team and feature requests",
      stat: "Fast response",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  const comparisonFeatures = [
    { name: "Practice Questions", free: "20/day", premium: "Unlimited", highlight: true },
    { name: "AI Study Plan", free: "Basic", premium: "Advanced + Adaptive", highlight: true },
    { name: "Progress Analytics", free: "Limited", premium: "Detailed + Predictive", highlight: false },
    { name: "AI Explanations", free: "5/day", premium: "Unlimited", highlight: true },
    { name: "Topic Drilling", free: "3/day", premium: "Unlimited", highlight: false },
    { name: "Mock Exams", free: false, premium: true, highlight: true },
    { name: "Score Predictions", free: false, premium: true, highlight: false },
    { name: "Weak Spot Analysis", free: false, premium: true, highlight: true },
    { name: "Export Progress", free: false, premium: true, highlight: false },
    { name: "Priority Support", free: false, premium: true, highlight: false },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      score: "+120 points",
      text: "PrepSt+ helped me focus on my weak areas. The AI explanations are like having a tutor available 24/7. Went from 1280 to 1400!",
      avatar: "SM",
      school: "Stanford '27",
    },
    {
      name: "Jason K.",
      score: "+150 points",
      text: "The unlimited drilling feature was a game-changer for my math section. The adaptive study plan knew exactly what I needed to work on.",
      avatar: "JK",
      school: "MIT '26",
    },
    {
      name: "Emily R.",
      score: "+180 points",
      text: "I was skeptical at first, but I went from 1150 to 1330 in just 6 weeks. The mock exams really helped with my test anxiety.",
      avatar: "ER",
      school: "UCLA '27",
    },
    {
      name: "Michael T.",
      score: "+95 points",
      text: "Best investment I made for my SAT prep. The analytics showed me I was wasting time on topics I already mastered.",
      avatar: "MT",
      school: "Berkeley '26",
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely! You can cancel your subscription at any time with no questions asked. You'll continue to have full access until the end of your billing period. No hidden fees, no penalties.",
    },
    {
      question: "How does the 7-day money-back guarantee work?",
      answer: "If you're not completely satisfied with PrepSt+ within 7 days of your purchase, simply contact our support team for a full refund. No questions asked, no hassle.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and Apple Pay. All payments are securely processed through Stripe.",
    },
    {
      question: "Will my subscription automatically renew?",
      answer: "Yes, your subscription will automatically renew at the end of each billing period to ensure uninterrupted access. You can turn off auto-renewal at any time.",
    },
    {
      question: "Can I switch between plans?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated difference.",
    },
    {
      question: "Is PrepSt+ worth it if I only have a month before my SAT?",
      answer: "Many of our students see significant improvements in just 2-4 weeks! Our AI adapts to your timeline and focuses on the highest-impact areas.",
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
      {/* Floating Pigs - Decorative elements */}
      <FloatingPig src="/pig1.png" className="top-20 left-[3%] hidden lg:block" size={100} />
      <FloatingPig src="/pig2.png" className="top-32 right-[4%] hidden lg:block" size={90} />
      <FloatingPig src="/pig4.png" className="top-[400px] right-[2%] hidden xl:block" size={85} />
      <FloatingPig src="/pig5.png" className="top-[600px] left-[3%] hidden xl:block" size={95} />
      <FloatingPig src="/pig6.png" className="bottom-[400px] right-[2%] hidden lg:block" size={90} />
      <FloatingPig src="/pig7.png" className="bottom-[300px] left-[4%] hidden xl:block" size={100} />

      {/* Sticky Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg transition-transform duration-300 ${showStickyCta ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground">PrepSt+ Premium</p>
              <p className="text-xs text-muted-foreground">Unlock your full potential</p>
            </div>
          </div>
          <Button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg"
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 relative z-20">
        {/* Social Proof Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-blue-500/10 border border-emerald-500/20 mb-12">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-8 p-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500'].map((color, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-background flex items-center justify-center text-[10px] text-white font-bold`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{userCount.toLocaleString()}+ Students</p>
                <p className="text-xs text-muted-foreground">Trust PrepSt+</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">4.9/5 Rating</p>
                <p className="text-xs text-muted-foreground">Based on 2,000+ reviews</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-foreground">+{avgImprovement} Points</p>
                <p className="text-xs text-muted-foreground">Average improvement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Limited: 50% Off First Month
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Unlock Your{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Dream SAT Score
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Join <span className="font-semibold text-foreground">12,500+ students</span> who improved their scores by an average of <span className="font-semibold text-foreground">127 points</span> with AI-powered personalized prep.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="h-5 w-5 mr-2" />
              Start My Transformation
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground">
              7-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Instant Access</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-500" />
            <span>7-Day Money Back</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Crush the SAT
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI adapts to your learning style, identifies your weak spots, and creates a personalized study plan that gets results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-2xl ${feature.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {feature.stat}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Free vs PrepSt+
            </h2>
            <p className="text-muted-foreground">
              See why thousands of students upgrade to premium
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 border-b border-border">
              <div className="p-4 font-semibold text-foreground">Feature</div>
              <div className="p-4 font-semibold text-foreground text-center">Free</div>
              <div className="p-4 font-semibold text-primary text-center bg-primary/5">PrepSt+</div>
            </div>
            {comparisonFeatures.map((feature, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 border-b border-border last:border-0 ${feature.highlight ? 'bg-muted/20' : ''}`}
              >
                <div className="p-4 text-sm text-foreground font-medium">{feature.name}</div>
                <div className="p-4 text-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">{feature.free}</span>
                  )}
                </div>
                <div className="p-4 text-center bg-primary/5">
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <Check className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                    )
                  ) : (
                    <span className="text-sm font-semibold text-primary">{feature.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mb-20 scroll-mt-24">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start with a 1-week trial or commit to 6 months for maximum savings. All plans include full access to every feature.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'bg-gradient-to-br from-primary/15 to-purple-500/10 border-2 border-primary shadow-xl scale-[1.02]'
                    : 'bg-card border border-border hover:border-primary/30 hover:shadow-lg'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      plan.popular
                        ? 'bg-primary text-white'
                        : plan.savings
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-foreground'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center pt-2">
                  <h3 className="font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{plan.duration}</p>
                  
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-foreground">
                      ${plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{plan.total}</p>
                  
                  <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    {plan.perDay}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {['Full feature access', 'Unlimited AI tutor', 'All practice materials'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                {selectedPlan === plan.id && (
                  <div className="absolute inset-x-0 -bottom-px h-1 bg-gradient-to-r from-primary to-purple-500 rounded-b-2xl" />
                )}
              </div>
            ))}
          </div>

          {/* Main CTA Card */}
          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#7c6ff5] to-[#6b5ce7]" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />
              </div>
              
              <div className="relative z-10 p-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">PrepSt+ Premium</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">
                  ${selectedPlanData.price}
                </h3>
                <p className="text-white/80 mb-6">for {selectedPlanData.duration}</p>

                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Get Instant Access
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              7-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Users className="w-3 h-3 mr-1" />
              Student Success Stories
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Real Results from Real Students
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of students who transformed their SAT scores with PrepSt+
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.school}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    {testimonial.score}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Now / Urgency Section */}
        <div className="mb-20">
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-red-500/10 text-red-600 border-red-500/20">
                <Clock className="w-3 h-3 mr-1" />
                Limited Time Offer
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Upgrade Now?
              </h2>
              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Every Day Counts</h3>
                  <p className="text-sm text-muted-foreground">
                    The sooner you start, the more time our AI has to identify and fix your weak spots.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">50% Off First Month</h3>
                  <p className="text-sm text-muted-foreground">
                    New subscribers get 50% off their first month. Limited time offer.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Risk-Free Trial</h3>
                  <p className="text-sm text-muted-foreground">
                    7-day money-back guarantee. If you don't love it, get a full refund.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about PrepSt+
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Score?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join 12,500+ students who achieved their dream SAT scores with PrepSt+. 
            Your future self will thank you.
          </p>
          <Button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
          >
            <Crown className="h-5 w-5 mr-2" />
            Get PrepSt+ Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            7-day money-back guarantee • Cancel anytime • No questions asked
          </p>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border p-4 md:hidden transition-transform duration-300 ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">PrepSt+ Premium</p>
            <p className="text-sm text-primary">${selectedPlanData.price}/{selectedPlanData.duration}</p>
          </div>
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg"
          >
            {isLoading ? "Loading..." : "Subscribe"}
          </Button>
        </div>
      </div>

      <OnboardingModal pageId="subscription" steps={ONBOARDING_CONTENT.subscription} />
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
