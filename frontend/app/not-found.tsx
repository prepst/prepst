import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <img src="/prepst.svg" alt="" className="mb-6 h-14 w-auto" />
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">That page isn't here</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The link may be old, or the page may have moved. Head back to Prep St and pick up where you left off.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"
        >
          Open dashboard
        </Link>
      </div>
    </div>
  );
}
