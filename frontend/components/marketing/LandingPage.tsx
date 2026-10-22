import Link from "next/link";
import { BookOpen, PenLine, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const work = [
  {
    title: "Study plan",
    detail: "A schedule from your test date and the topics you miss.",
    icon: BookOpen,
    bar: "bg-study",
    chip: "bg-study-soft text-study",
  },
  {
    title: "Practice",
    detail: "Short blocks when you have 15 minutes, or a full mock exam.",
    icon: PenLine,
    bar: "bg-practice",
    chip: "bg-practice-soft text-practice",
  },
  {
    title: "Review",
    detail: "Explanations, vocabulary, and the questions you saved.",
    icon: RotateCcw,
    bar: "bg-exam",
    chip: "bg-exam-soft text-exam",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" aria-label="Prep St home">
            <img src="/prepst.svg" alt="Prep St" className="h-9 w-auto" />
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            SAT practice with a plan you can follow.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Prep St is free. Set a test date, work the sessions, and review what you missed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">Create a free account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {work.map((item) => (
            <li key={item.title} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className={`h-1.5 ${item.bar}`} />
              <div className="p-5">
                <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${item.chip}`}>
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl">
            Prep St. SAT is a registered trademark of the College Board, which is not affiliated with this app.
          </p>
          <nav className="flex gap-4">
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
