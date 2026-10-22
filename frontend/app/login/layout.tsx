import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Prep St to continue your SAT study plan.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
