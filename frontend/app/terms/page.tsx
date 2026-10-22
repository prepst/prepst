import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/marketing/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Prep St.",
};

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service" updated="October 21, 2026">
      <LegalSection heading="Using Prep St">
        <p>
          Prep St is a free SAT practice tool for students. You need an account to save a study plan and practice history. You can sign up with email or Google. Apple sign-in is not offered.
        </p>
        <p>
          SAT is a registered trademark of the College Board. Prep St is not affiliated with, endorsed by, or sponsored by the College Board. A score in this app is a practice estimate, not an official SAT score.
        </p>
      </LegalSection>
      <LegalSection heading="Your account">
        <p>
          Keep your password to yourself and use accurate account information. You are responsible for activity on your account. You can reset a password from the sign-in page. To close an account, ask in the Prep St Discord from the email on the account.
        </p>
      </LegalSection>
      <LegalSection heading="What the product does">
        <p>
          Study plans, question selection, and score estimates are tools to help you practice. They are not a promise of a particular score. AI explanations can be incomplete or incorrect. Check the worked solution and the answer choices yourself.
        </p>
        <p>
          Access is free right now. Features can change, and a feature that is available today might be adjusted later. If that happens, your existing practice history stays tied to your account.
        </p>
      </LegalSection>
      <LegalSection heading="Acceptable use">
        <p>
          Don't scrape the question bank, share your login, attempt to break the service, or upload anything you don't have the right to store. Practice content is for your own studying.
        </p>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>
          Questions about these terms go to the Prep St Discord at discord.gg/A6xqzcvjvZ.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
