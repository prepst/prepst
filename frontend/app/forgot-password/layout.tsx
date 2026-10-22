import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Send a password reset link for your Prep St account.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
