import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "A plan that fits your date",
    description:
      "Set a target score and test date. Prep St builds a study plan around the time you actually have.",
  },
  {
    icon: Target,
    title: "Drills for weak topics",
    description:
      "Practice one skill at a time. Sessions focus on the topics that still need work.",
  },
  {
    icon: ClipboardCheck,
    title: "Full mock exams",
    description:
      "Sit a timed exam in the real module order, then review a score breakdown.",
  },
  {
    icon: Timer,
    title: "Short practice when you're busy",
    description:
      "Start a 5, 15, or 30 minute session when you don't have a full block free.",
  },
  {
    icon: Sparkles,
    title: "Explanations you can question",
    description:
      "Ask why an answer is right or wrong. The tutor can try another explanation.",
  },
  {
    icon: MessageCircle,
    title: "Vocabulary, saved questions, review",
    description:
      "Keep words, bookmarks, and missed questions in one place and come back to them.",
  },
];

const steps = [
  {
    title: "Create a free account",
    description: "Sign up with email or Google. Full practice access is free.",
  },
  {
    title: "Tell us your goal",
    description: "Add a target score and test date so the plan matches your calendar.",
  },
  {
    title: "Practice, then review",
    description: "Work sessions, drills, and a mock exam. Use the results to decide what to study next.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center" aria-label="Prep St home">
            <img src="/prepst.svg" alt="Prep St" className="h-10 w-auto" />
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Free SAT prep
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Study for the SAT with a plan, not a pile of worksheets.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Prep St is a free practice app for students. Build a study plan, drill weak topics, take mock exams, and review what you missed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90"
              >
                Create a free account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-6 text-base font-semibold hover:bg-muted"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border p-5">
                <p className="text-sm font-semibold text-primary">0{index + 1}</p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Prep St. SAT is a registered trademark of the College Board, which is not affiliated with this app.</p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <a
              href="https://discord.gg/A6xqzcvjvZ"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Discord
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
