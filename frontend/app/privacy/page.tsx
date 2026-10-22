import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/marketing/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Prep St handles account, practice, and profile information.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" updated="October 21, 2026">
      <LegalSection heading="What this covers">
        <p>
          Prep St is an SAT practice app. This policy describes the information the app stores when you create an account and study. SAT is a registered trademark of the College Board, which is not affiliated with Prep St.
        </p>
      </LegalSection>
      <LegalSection heading="Information you give us">
        <p>
          Creating an account stores your email and the name you provide, either from the sign-up form or from Google if you use that option. On your profile you can also add a grade level, school, phone number, parent email, bio, study goal, and a profile photo. Those fields are optional.
        </p>
        <p>
          Practice activity is stored with your account: study plan, sessions, answers, mock exams, vocabulary, saved questions, and preferences such as theme.
        </p>
      </LegalSection>
      <LegalSection heading="How that information is used">
        <p>
          We use it to sign you in, build your study plan, score practice, and show your progress. When you ask for an explanation or use the tutor, the question and your message are sent to an AI provider so it can write a reply. Those replies can be wrong, and they are not a substitute for the official answer key.
        </p>
        <p>
          Accounts and the database are hosted with Supabase. The site uses Vercel Analytics for aggregate usage. Joining the Prep St Discord is optional and is governed by Discord once you leave the app.
        </p>
      </LegalSection>
      <LegalSection heading="What we don't do">
        <p>
          Prep St does not sell personal information. We don't show a public leaderboard of your scores, and we don't use your parent email unless you type it into your profile.
        </p>
      </LegalSection>
      <LegalSection heading="Your choices">
        <p>
          You can edit your profile in the app and sign out of this browser from Settings. To delete your account and the practice data stored with it, contact the Prep St Discord and ask for deletion from the email on the account. Password resets are sent from the sign-in page.
        </p>
      </LegalSection>
      <LegalSection heading="Questions">
        <p>
          The support channel for this app is the Prep St Discord at discord.gg/A6xqzcvjvZ.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
