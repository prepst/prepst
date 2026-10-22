import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free Prep St account for SAT practice.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
