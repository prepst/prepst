import type { Metadata } from "next";
import { HomeGate } from "@/components/marketing/HomeGate";
import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: { absolute: "Prep St — free SAT practice" },
  description:
    "Free SAT prep with a personal study plan, topic drills, vocabulary, and full mock exams.",
};

export default function Home() {
  return (
    <HomeGate>
      <LandingPage />
    </HomeGate>
  );
}
