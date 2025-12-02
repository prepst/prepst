"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  BookOpen,
  Target,
  Calendar,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api, StudyPlanRequest } from "@/lib/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ValidationError {
  field: string;
  message: string;
}

const steps = [
  {
    id: 1,
    title: "Welcome",
    description: "Starting point",
  },
  {
    id: 2,
    title: "Schedule",
    description: "Pace & availability",
  },
  {
    id: 3,
    title: "Diagnostic",
    description: "Optional test",
  },
  {
    id: 4,
    title: "Goals",
    description: "Scores & dates",
  },
];

function OnboardContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasExistingPlan, setHasExistingPlan] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);

  const [formData, setFormData] = useState({
    isFirstTime: true,
    weeklyStudyHours: 10,
    mockTestDay: "saturday",
    currentMathScore: "",
    targetMathScore: "",
    currentEnglishScore: "",
    targetEnglishScore: "",
    testDate: undefined as Date | undefined,
  });

  // Check if user already has a study plan
  useEffect(() => {
    const checkExistingPlan = async () => {
      try {
        await api.getStudyPlan();
        setHasExistingPlan(true);
      } catch {
        setHasExistingPlan(false);
      } finally {
        setCheckingPlan(false);
      }
    };
    checkExistingPlan();
  }, []);

  // Restore onboarding progress
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnFromDiagnostic = params.get('returnFromDiagnostic');

    if (returnFromDiagnostic === 'true') {
      const savedProgress = localStorage.getItem('onboardingProgress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.testDate) {
          progress.testDate = new Date(progress.testDate);
        }
        setFormData(progress);
        setCurrentStep(4);
        localStorage.removeItem('onboardingProgress');
      }
    }
  }, []);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateField = (field: string, value: any): string | null => {
    const numValue = typeof value === "string" ? parseInt(value) : 0;
    switch (field) {
      case "currentMathScore":
      case "targetMathScore":
      case "currentEnglishScore":
      case "targetEnglishScore":
        if (!value || value === "") return null;
        if (numValue < 200 || numValue > 800) return "Score must be 200-800";
        if (numValue % 10 !== 0) return "Score must be multiple of 10";
        break;
      case "testDate":
        if (!value) return null;
        const date = value as Date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return "Must be future date";
        break;
    }
    return null;
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setError(null);

    // Validate scores
    const currentMath = parseInt(formData.currentMathScore);
    const targetMath = parseInt(formData.targetMathScore);
    const currentEnglish = parseInt(formData.currentEnglishScore);
    const targetEnglish = parseInt(formData.targetEnglishScore);

    // Check if target scores are valid numbers
    if (isNaN(targetMath) || isNaN(targetEnglish)) {
      setError("Please enter valid target scores");
      return;
    }

    // Check score ranges
    if (targetMath < 200 || targetMath > 800 || targetEnglish < 200 || targetEnglish > 800) {
      setError("Target scores must be between 200 and 800");
      return;
    }

    // If not first time, validate current scores too
    if (!formData.isFirstTime) {
        if (isNaN(currentMath) || isNaN(currentEnglish)) {
            setError("Please enter your current scores");
            return;
        }
        if (currentMath < 200 || currentMath > 800 || currentEnglish < 200 || currentEnglish > 800) {
            setError("Current scores must be between 200 and 800");
            return;
        }
    }

    if (!formData.testDate) {
      setError("Please select a test date");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: StudyPlanRequest = {
        current_math_score: formData.isFirstTime ? 200 : currentMath,
        target_math_score: targetMath,
        current_rw_score: formData.isFirstTime ? 200 : currentEnglish,
        target_rw_score: targetEnglish,
        test_date: format(formData.testDate, "yyyy-MM-dd"),
      };

      await api.generateStudyPlan(requestData);
      await api.post("/api/complete-onboarding");
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create study plan";
      // User-friendly error for the specific API validation error
      if (errorMessage.includes("int_type") || errorMessage.includes("Input should be a valid integer")) {
          setError("Please ensure all score fields are valid numbers.");
      } else {
          setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Shared Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const cardVariants = {
    hover: { y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
    tap: { scale: 0.98 }
  };

  if (checkingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      
      {/* Progress Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            Prep St
          </div>
          
          <div className="flex items-center gap-1">
             <span className="text-sm font-medium text-slate-500">Step {currentStep} of 4</span>
             <div className="w-24 h-2 bg-slate-100 rounded-full ml-3 overflow-hidden">
               <motion.div 
                 className="h-full bg-primary"
                 initial={{ width: 0 }}
                 animate={{ width: `${(currentStep / 4) * 100}%` }}
                 transition={{ duration: 0.5, ease: "easeInOut" }}
               />
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: WELCOME */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Let's customize your journey
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Tell us about your experience with the SAT so we can build the perfect plan for you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.button
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => updateFormData("isFirstTime", true)}
                    className={cn(
                      "group relative overflow-hidden p-8 rounded-2xl text-left border-2 transition-all duration-200",
                      formData.isFirstTime
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                        : "border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-primary/50"
                    )}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">First-time</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                      I'm new to the SAT. I want to start from the basics and build a strong foundation.
                    </p>
                    {formData.isFirstTime && (
                      <div className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </motion.button>

                  <motion.button
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => updateFormData("isFirstTime", false)}
                    className={cn(
                      "group relative overflow-hidden p-8 rounded-2xl text-left border-2 transition-all duration-200",
                      !formData.isFirstTime
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                        : "border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-primary/50"
                    )}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                      <Target className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Retaking</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                      I want to improve my previous score. I need advanced practice and targeted drills.
                    </p>
                    {!formData.isFirstTime && (
                      <div className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </motion.button>
                </div>

                {hasExistingPlan && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3"
                   >
                     <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                     <div className="text-sm text-amber-800 dark:text-amber-200">
                       <strong>Note:</strong> You already have a plan. Continuing will replace it.
                     </div>
                   </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2: SCHEDULE */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Your study schedule
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Consistency is key. Set a realistic pace you can stick to.
                  </p>
                </div>

                <div className="grid gap-8">
                  {/* Hours Slider */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-semibold text-slate-900 dark:text-white">Weekly Commitment</h3>
                           <p className="text-sm text-slate-500">Hours per week</p>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {formData.weeklyStudyHours} <span className="text-lg font-medium text-slate-400">hrs</span>
                      </div>
                    </div>

                    <input
                       type="range"
                       min="1"
                       max="40"
                       value={formData.weeklyStudyHours}
                       onChange={(e) => updateFormData("weeklyStudyHours", parseInt(e.target.value))}
                       className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
                      <span>Casual (5h)</span>
                      <span>Serious (20h)</span>
                      <span>Intense (40h)</span>
                    </div>
                  </div>

                  {/* Mock Test Day */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-semibold text-slate-900 dark:text-white">Mock Test Day</h3>
                           <p className="text-sm text-slate-500">Best day for full-length practice exams</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
                          <button
                            key={day}
                            onClick={() => updateFormData("mockTestDay", day)}
                            className={cn(
                              "aspect-square rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 border",
                              formData.mockTestDay === day
                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"
                            )}
                          >
                            <span className="capitalize">{day.slice(0, 3)}</span>
                            {formData.mockTestDay === day && <CheckCircle2 className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DIAGNOSTIC */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8 text-center"
              >
                <div className="inline-flex p-4 bg-primary/10 text-primary rounded-full mb-4">
                  <Target className="w-8 h-8" />
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Baseline Diagnostic
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Take a quick 20-minute mini-test to let our AI analyze your current strengths and weaknesses.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
                    {[
                        { label: "Precision", text: "Pinpoint weak spots" },
                        { label: "Efficiency", text: "Skip what you know" },
                        { label: "Customization", text: "Tailored curriculum" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-3" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">{item.label}</h3>
                            <p className="text-sm text-slate-500">{item.text}</p>
                        </div>
                    ))}
                </div>

                <Alert className="max-w-2xl mx-auto bg-primary/5 dark:bg-primary/20 border-primary/20 dark:border-primary/80">
                    <AlertDescription className="text-primary dark:text-primary/70 flex items-center gap-2 justify-center">
                        <Sparkles className="w-4 h-4" />
                        Recommended for the most accurate study plan.
                    </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* STEP 4: GOALS */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Set your targets
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Aim high. We'll help you get there.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* MATH CARD */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                     <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">M</div>
                        <h3 className="font-bold text-lg">Math</h3>
                     </div>

                     <div className="space-y-4">
                        {!formData.isFirstTime && (
                           <div>
                              <Label className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1.5 block">Current Score</Label>
                              <Input 
                                type="number" 
                                placeholder="e.g. 500"
                                value={formData.currentMathScore}
                                onChange={(e) => updateFormData("currentMathScore", e.target.value)}
                                className="text-lg h-12 bg-slate-50 dark:bg-slate-900 border-slate-200"
                              />
                           </div>
                        )}
                        <div>
                           <Label className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1.5 block">Target Score</Label>
                           <Input 
                              type="number" 
                              placeholder="e.g. 700"
                              value={formData.targetMathScore}
                              onChange={(e) => updateFormData("targetMathScore", e.target.value)}
                              className="text-lg h-12 border-green-200 focus:border-green-500 focus:ring-green-500/20"
                           />
                        </div>
                     </div>
                  </div>

                  {/* ENGLISH CARD */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                     <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">E</div>
                        <h3 className="font-bold text-lg">English</h3>
                     </div>

                     <div className="space-y-4">
                        {!formData.isFirstTime && (
                           <div>
                              <Label className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1.5 block">Current Score</Label>
                              <Input 
                                type="number" 
                                placeholder="e.g. 500"
                                value={formData.currentEnglishScore}
                                onChange={(e) => updateFormData("currentEnglishScore", e.target.value)}
                                className="text-lg h-12 bg-slate-50 dark:bg-slate-900 border-slate-200"
                              />
                           </div>
                        )}
                        <div>
                           <Label className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1.5 block">Target Score</Label>
                           <Input 
                              type="number" 
                              placeholder="e.g. 700"
                              value={formData.targetEnglishScore}
                              onChange={(e) => updateFormData("targetEnglishScore", e.target.value)}
                              className="text-lg h-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                           />
                        </div>
                     </div>
                  </div>
                </div>

                {/* TEST DATE */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                         <Calendar className="w-5 h-5 text-primary" />
                       </div>
                       <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Target Test Date</h3>
                          <p className="text-sm text-slate-500">When is your exam?</p>
                       </div>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full sm:w-[240px] justify-start text-left font-normal text-base h-12",
                              !formData.testDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.testDate ? format(formData.testDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={formData.testDate}
                            onSelect={(date) => updateFormData("testDate", date)}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
          
          {/* ERROR DISPLAY */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-12 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={cn("text-slate-500 hover:text-slate-900", currentStep === 1 && "opacity-0 pointer-events-none")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {currentStep === 3 ? (
              <div className="flex gap-4">
                 <Button variant="ghost" onClick={handleNext} className="text-slate-500">
                   Skip for now
                 </Button>
                 <Button 
                   onClick={() => {
                    localStorage.setItem('onboardingProgress', JSON.stringify(formData));
                    router.push('/diagnostic-test?returnToOnboarding=true');
                   }}
                   className="bg-slate-900 text-white hover:bg-slate-800 px-8 h-12 rounded-full shadow-lg shadow-slate-900/20 transition-all hover:scale-105"
                 >
                   Start Diagnostic
                   <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </div>
            ) : (
              <Button
                onClick={currentStep === 4 ? handleSubmit : handleNext}
                disabled={isLoading}
                className="bg-primary text-primary-foreground px-8 h-12 rounded-full text-base shadow-lg shadow-primary/25 transition-all hover:scale-105"
              >
                {currentStep === 4 ? (isLoading ? "Creating Plan..." : "Finish Setup") : "Continue"}
                {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <ProtectedRoute>
      <OnboardContent />
    </ProtectedRoute>
  );
}