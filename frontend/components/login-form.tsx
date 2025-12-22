"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Loader2,
  LogIn,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/onboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Left Side - Form */}
      <div
        className={cn(
          "w-full lg:w-1/2 flex flex-col p-8 lg:p-16 lg:pl-[250px] border-r border-border/40 pt-0 lg:pt-0",
          className
        )}
        {...props}
      >
        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Welcome back!
          </h1>
          <p className="text-base text-muted-foreground mb-8">
            Sign in to continue to PrepSt.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 rounded-xl border-border/60 bg-card hover:bg-accent hover:text-foreground text-muted-foreground font-medium transition-all"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="w-full h-12 rounded-xl border-border/60 bg-card hover:bg-accent hover:text-foreground text-muted-foreground font-medium transition-all"
            >
              <svg
                className="mr-3 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Sign in with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6 before:h-px before:flex-1 before:bg-border/50 after:h-px after:flex-1 after:bg-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              OR
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-muted-foreground ml-1"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-xl bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all text-base text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 rounded-xl bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all text-base text-foreground placeholder:text-muted-foreground/50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 text-white hover:opacity-90"
              style={{ backgroundColor: "#866ffe" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-card/50 backdrop-blur-sm relative overflow-hidden border-l border-border/40">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-16 pr-[250px] pt-0">
          {/* Stats Text */}
          <div className="text-center mb-8">
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              AI-powered practice with personalized feedback to help you reach
              your dream score.
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-3 mb-12">
            {/* <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-bold text-primary tabular-nums">
                10K+
              </span>
              <span className="text-sm text-muted-foreground">Students</span>
            </div> */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                5000+
              </span>
              <span className="text-sm text-muted-foreground">Questions</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                200+
              </span>
              <span className="text-sm text-muted-foreground">
                Avg Score Gain
              </span>
            </div>
          </div>

          {/* 3D SAT Visual */}
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>

            {/* Background SAT text */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
              <span className="text-[180px] font-bold text-primary">SAT</span>
            </div>

            {/* 3D Book Stack Visual */}
            <div className="relative group cursor-pointer">
              <svg
                viewBox="0 0 200 200"
                className="w-56 h-56 transition-transform duration-500 group-hover:scale-105"
              >
                {/* Shadow ellipse */}
                <ellipse
                  cx="100"
                  cy="175"
                  rx="65"
                  ry="12"
                  fill="rgba(0, 0, 0, 0.1)"
                  className="transition-all duration-500 group-hover:opacity-50 group-hover:ry-8"
                />

                {/* Bottom book - Blue */}
                <g
                  transform="translate(0, 20)"
                  className="transition-all duration-500 group-hover:-translate-y-2 group-hover:translate-x-1"
                >
                  <path
                    d="M35 120 L35 90 L165 90 L165 120 L35 120"
                    fill="#3b82f6"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M35 90 L50 75 L180 75 L165 90"
                    fill="#60a5fa"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M165 90 L180 75 L180 105 L165 120"
                    fill="#2563eb"
                    stroke="#1e40af"
                    strokeWidth="1.5"
                  />
                  {/* Book spine lines */}
                  <line
                    x1="38"
                    y1="95"
                    x2="38"
                    y2="117"
                    stroke="#1e40af"
                    strokeWidth="1"
                  />
                  <line
                    x1="42"
                    y1="95"
                    x2="42"
                    y2="117"
                    stroke="#3b82f6"
                    strokeWidth="0.5"
                  />
                  {/* Book label */}
                  <text
                    x="100"
                    y="108"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    WRITING
                  </text>
                </g>

                {/* Middle book - Green */}
                <g
                  transform="translate(5, 0)"
                  className="transition-all duration-500 delay-75 group-hover:-translate-y-4 group-hover:translate-x-0.5"
                >
                  <path
                    d="M30 100 L30 70 L160 70 L160 100 L30 100"
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M30 70 L45 55 L175 55 L160 70"
                    fill="#34d399"
                    stroke="#059669"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M160 70 L175 55 L175 85 L160 100"
                    fill="#059669"
                    stroke="#047857"
                    strokeWidth="1.5"
                  />
                  {/* Book label */}
                  <text
                    x="95"
                    y="88"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    MATH
                  </text>
                </g>

                {/* Top book - Purple */}
                <g
                  transform="translate(10, -20)"
                  className="transition-all duration-500 delay-150 group-hover:-translate-y-6 group-hover:-translate-x-0.5"
                >
                  <path
                    d="M25 80 L25 50 L155 50 L155 80 L25 80"
                    fill="#866ffe"
                    stroke="#6d5dd3"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M25 50 L40 35 L170 35 L155 50"
                    fill="#a78bfa"
                    stroke="#6d5dd3"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M155 50 L170 35 L170 65 L155 80"
                    fill="#6d5dd3"
                    stroke="#5b4fc7"
                    strokeWidth="1.5"
                  />
                  {/* Book label */}
                  <text
                    x="90"
                    y="68"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    READING
                  </text>
                </g>

                {/* Floating pencil */}
                <g transform="translate(10, 40) rotate(-30)">
                  <rect
                    x="0"
                    y="0"
                    width="45"
                    height="8"
                    rx="1"
                    fill="#f59e0b"
                  />
                  <polygon points="45,0 55,4 45,8" fill="#d97706" />
                  <rect
                    x="0"
                    y="0"
                    width="8"
                    height="8"
                    rx="1"
                    fill="#fbbf24"
                  />
                </g>

                {/* Sparkle effects */}
                <g fill="#866ffe">
                  <circle cx="45" cy="25" r="2">
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="170" cy="100" r="1.5">
                    <animate
                      attributeName="opacity"
                      values="0.5;1;0.5"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle cx="30" cy="130" r="1.5">
                    <animate
                      attributeName="opacity"
                      values="0.4;1;0.4"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </svg>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-8 max-w-sm">
            <div className="p-4 rounded-xl bg-background/50 border border-border/40 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground italic">
                "I improved my score from 1320 to 1520 in just 2 months!"
              </p>
              <p className="mt-2 text-xs text-primary font-medium">
                — Alex K., Stanford Admit
              </p>
            </div>
          </div>
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
