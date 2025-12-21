"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OTPForm } from "@/components/otp-form";
import { useProfile } from "@/lib/hooks/useProfile";

export default function OTPPage() {
  const { user, loading: authLoading } = useAuth();
  const { profileData, isLoading: profileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !profileLoading && user && profileData) {
      if (profileData?.profile?.onboarding_completed === false) {
        router.push("/onboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, profileData, profileLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <OTPForm />
      </div>
    </div>
  );
}
