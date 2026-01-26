"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProfile } from "@/hooks/queries";
import { useUpdatePreferences } from "@/hooks/mutations";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import {
  Monitor,
  BookOpen,
  Check,
  User,
  Palette,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Zap,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PremiumUpgradeDialog } from "@/components/premium/PremiumUpgradeDialog";

function SettingsContent() {
  const router = useRouter();
  const { data: profileData } = useProfile();
  const { theme, setTheme } = useTheme();
  const updatePreferencesMutation = useUpdatePreferences();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // TODO: Replace with actual premium status check from user profile
  const isPremium = false;

  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    setTheme(newTheme);
    // Also update backend preference if possible
    updatePreferencesMutation.mutate({ theme: newTheme });
  };

  const handleResetStudyPlan = async () => {
    try {
      setIsResetting(true);
      await api.deleteStudyPlan();
      router.push("/onboard");
    } catch (error) {
      console.error("Failed to reset study plan:", error);
      setSaveStatus("Failed to reset study plan");
    } finally {
      setIsResetting(false);
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "subscription", label: "Subscription", icon: Crown },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "study", label: "Study Plan", icon: BookOpen },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-background">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <Alert
              className={
                saveStatus.includes("Failed")
                  ? "border-destructive/50 text-destructive dark:border-destructive"
                  : "border-green-500/50 text-green-600 dark:text-green-400"
              }
            >
              <div className="flex items-center gap-2">
                {saveStatus.includes("Failed") ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <AlertDescription>{saveStatus}</AlertDescription>
              </div>
            </Alert>
          )}

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="flex w-full bg-muted/50 p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    View your personal details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData?.profile.email || ""}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your email is managed by your login provider.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-foreground">Account Role</Label>
                      <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-card">
                        <span className="capitalize text-sm font-medium text-foreground">
                          {profileData?.profile.role || "Student"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    onClick={signOut}
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Crown className="w-5 h-5" />
                    Your Subscription
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your PrepSt+ subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isPremium ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                          <Zap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">PrepSt+ Active</h4>
                          <p className="text-sm text-muted-foreground">$14.99/month</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        Manage Subscription
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Free Plan</h4>
                          <p className="text-sm text-muted-foreground">Basic features included</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          Upgrade to PrepSt+
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Unlock Peppa Sessions, Progress Analytics, Unlimited AI Help, and more for just $14.99/month.
                        </p>
                        <Button
                          onClick={() => setShowUpgradeDialog(true)}
                          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Palette className="w-5 h-5" />
                    Theme Preference
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Choose how the application looks to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={theme}
                    onValueChange={(value) =>
                      handleThemeChange(value as "light" | "dark" | "auto")
                    }
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <div className="space-y-2">
                      <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${theme === 'light' ? 'border-primary bg-accent' : 'border-muted bg-card'}`}>
                        <RadioGroupItem value="light" className="sr-only" />
                        <div className="space-y-2 text-center">
                          <div className="p-2 rounded-full bg-background border shadow-sm mx-auto">
                            <div className="w-8 h-8 bg-[#f4f4f5] rounded-md" />
                          </div>
                          <span className="block font-medium text-foreground">Light</span>
                        </div>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${theme === 'dark' ? 'border-primary bg-accent' : 'border-muted bg-card'}`}>
                        <RadioGroupItem value="dark" className="sr-only" />
                        <div className="space-y-2 text-center">
                          <div className="p-2 rounded-full bg-slate-950 border shadow-sm mx-auto">
                            <div className="w-8 h-8 bg-slate-800 rounded-md" />
                          </div>
                          <span className="block font-medium text-foreground">Dark</span>
                        </div>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className={`flex flex-col items-center justify-between rounded-xl border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all ${theme === 'auto' ? 'border-primary bg-accent' : 'border-muted bg-card'}`}>
                        <RadioGroupItem value="auto" className="sr-only" />
                        <div className="space-y-2 text-center">
                          <div className="p-2 rounded-full bg-gradient-to-r from-[#f4f4f5] to-slate-950 border shadow-sm mx-auto">
                            <Monitor className="w-8 h-8 text-foreground mix-blend-difference" />
                          </div>
                          <span className="block font-medium text-foreground">System</span>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Plan Tab */}
            <TabsContent value="study" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BookOpen className="w-5 h-5" />
                    Study Plan Management
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your current learning path
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-foreground">Reset Study Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        Want to start over? This will delete your current schedule and let you create a new one.
                        Your past practice history and stats will be preserved.
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="shrink-0 ml-4">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Study Plan?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete your current study plan? You will be redirected to the onboarding page to create a new one. This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { }}>Cancel</Button>
                          <Button
                            variant="destructive"
                            onClick={handleResetStudyPlan}
                            disabled={isResetting}
                          >
                            {isResetting ? "Resetting..." : "Yes, Reset Plan"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PremiumUpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
