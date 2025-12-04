"use client";

import { useState, useRef, useEffect } from "react";
import { useProfile } from "@/hooks/queries";
import { useUpdateProfile, useUploadProfilePhoto } from "@/hooks/mutations";
import type { components } from "@/lib/types/api.generated";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Edit2, Save, X, Target, Mail, Phone, School, GraduationCap, BookOpen, Trophy, Clock, Zap, Calendar } from "lucide-react";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  GRADE_LEVELS,
} from "@/lib/constants";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { motion } from "framer-motion";

type UserProfileUpdate = components["schemas"]["UserProfileUpdate"];

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profileData, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfileUpdate>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper functions
  const getDisplayName = () => {
    if (!profileData) return "";
    const profile = profileData.profile;
    if ((profile as any).name) return (profile as any).name;
    if (profile.email) return profile.email.split("@")[0];
    return "";
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    if (!displayName) return "U";
    const parts = displayName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName[0].toUpperCase();
  };

  useEffect(() => {
    if (isEditing) {
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [isEditing]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile({});
      setIsEditing(false);
    } else if (profileData?.profile) {
      setEditedProfile({
        name: (profileData.profile as any).name ?? "",
        bio: profileData.profile.bio ?? "",
        study_goal: profileData.profile.study_goal ?? "",
        grade_level: profileData.profile.grade_level ?? "",
        school_name: profileData.profile.school_name ?? "",
        phone_number: profileData.profile.phone_number ?? "",
        parent_email: profileData.profile.parent_email ?? "",
      } as any);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setFieldErrors({});

    updateProfileMutation.mutate(editedProfile, {
      onSuccess: () => {
        setIsEditing(false);
        setEditedProfile({});
        setIsSaving(false);
      },
      onError: (err: any) => {
        if (err.message && err.message.includes("phone_number")) {
          setFieldErrors({ phone_number: "Invalid phone number length" });
        } else if (err.message && err.message.includes("parent_email")) {
          setFieldErrors({ parent_email: "Invalid email address" });
        }
        
        if (err.message) {
          try {
            const errorData = JSON.parse(err.message);
            if (Array.isArray(errorData)) {
              const errors: Record<string, string> = {};
              errorData.forEach((error: any) => {
                if (error.loc && error.loc.length > 1) {
                  const fieldName = error.loc[error.loc.length - 1];
                  errors[fieldName] = error.msg;
                }
              });
              setFieldErrors(errors);
            }
          } catch {
            console.error("Failed to parse error:", err);
          }
        }
        setIsSaving(false);
      },
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File size must be less than ${MAX_IMAGE_SIZE_MB}MB`);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    setUploadingPhoto(true);
    setErrorMessage(null);
    
    uploadPhotoMutation.mutate(file, {
      onSuccess: () => setUploadingPhoto(false),
      onError: (err) => {
        console.error("Failed to upload photo:", err);
        setErrorMessage("Failed to upload photo");
        setUploadingPhoto(false);
      },
    });
  };

  if (isLoading) return <PageLoader message="Loading profile..." />;

  if (error || !profileData?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Unable to load profile</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Profile not found"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const { profile } = profileData;
  const stats = profileData.stats;

  return (
    <div className="min-h-screen bg-background p-6 lg:p-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile & Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your personal information and track your progress.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleEditToggle}
                  disabled={uploadingPhoto}
                  className="border-border/50 hover:bg-accent/50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={uploadingPhoto || isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleEditToggle}
                variant="outline"
                className="border-border/50 hover:bg-accent/50 shadow-sm"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </motion.div>
        </div>

        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center justify-between"
          >
            <span className="font-medium">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>
              <X className="h-5 w-5 opacity-70 hover:opacity-100" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card & Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Profile Identity Card */}
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              {/* Abstract Background Blob */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
              
              <div className="relative z-10 mb-6">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/20">
                  <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center relative group">
                    {profile.profile_photo_url ? (
                      <img
                        src={profile.profile_photo_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary">{getInitials()}</span>
                    )}
                    
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full w-10 h-10"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="relative z-10 space-y-2 mb-6">
                <h2 className="text-2xl font-bold text-foreground">{getDisplayName()}</h2>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
              </div>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {(profile.grade_level) && (
                  <div className="px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    Grade {profile.grade_level}
                  </div>
                )}
                {(profile.school_name) && (
                  <div className="px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium flex items-center gap-2 max-w-[200px] truncate">
                    <School className="w-3.5 h-3.5 text-blue-500" />
                    {profile.school_name}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-base font-medium border-border/50 hover:bg-accent/50"
                  onClick={() => router.push("/diagnostic-test")}
                >
                  <Target className="w-5 h-5 mr-3 text-primary" />
                  Start Diagnostic Test
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 text-base font-medium border-border/50 hover:bg-accent/50"
                  onClick={() => router.push("/dashboard/study-plan")}
                >
                  <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                  View Study Plan
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Middle/Right: Forms & Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Stats (Bento Grid) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                 <Trophy className="w-5 h-5 text-yellow-500" />
                 Performance Overview
               </h3>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Math Stat */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:bg-accent/5 transition-colors">
                     <span className="text-sm text-muted-foreground">Math Score</span>
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">{stats?.current_math_score || 0}</span>
                        <span className="text-xs text-muted-foreground">/ 800</span>
                     </div>
                     <div className="w-full bg-secondary/50 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, ((stats?.current_math_score || 0)/800)*100)}%` }} />
                     </div>
                     {stats?.improvement_math && (
                       <span className="text-xs text-green-500 font-medium">+{stats.improvement_math}% growth</span>
                     )}
                  </div>

                  {/* RW Stat */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:bg-accent/5 transition-colors">
                     <span className="text-sm text-muted-foreground">R&W Score</span>
                     <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">{stats?.current_rw_score || 0}</span>
                        <span className="text-xs text-muted-foreground">/ 800</span>
                     </div>
                     <div className="w-full bg-secondary/50 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(100, ((stats?.current_rw_score || 0)/800)*100)}%` }} />
                     </div>
                     {stats?.improvement_rw && (
                       <span className="text-xs text-green-500 font-medium">+{stats.improvement_rw}% growth</span>
                     )}
                  </div>

                  {/* Study Time */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:bg-accent/5 transition-colors">
                     <span className="text-sm text-muted-foreground">Hours Studied</span>
                     <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="text-2xl font-bold text-foreground">
                          {stats?.total_study_hours ? stats.total_study_hours.toFixed(1) : "0.0"}
                        </span>
                     </div>
                     <span className="text-xs text-muted-foreground">{stats?.total_practice_sessions || 0} sessions completed</span>
                  </div>

                  {/* Streak */}
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:bg-accent/5 transition-colors">
                     <span className="text-sm text-muted-foreground">Day Streak</span>
                     <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <span className="text-2xl font-bold text-foreground">{profileData?.streak?.current_streak || 0}</span>
                     </div>
                     <span className="text-xs text-muted-foreground">Best: {profileData?.streak?.longest_streak || 0} days</span>
                  </div>
               </div>
            </motion.div>

            {/* Edit Profile Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Personal Details
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Full Name</Label>
                       {isEditing ? (
                         <Input
                           id="name"
                           value={(editedProfile as any).name ?? ""}
                           onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value } as any)}
                           placeholder="Your full name"
                           className="h-12 bg-background/50 border-border/60 focus:ring-primary/20"
                         />
                       ) : (
                         <div className="h-12 flex items-center px-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                           {getDisplayName() || "Not set"}
                         </div>
                       )}
                     </div>
                     
                     <div className="space-y-2">
                       <Label htmlFor="grade-level" className="text-sm font-medium text-muted-foreground">Grade Level</Label>
                       {isEditing ? (
                         <select
                           id="grade-level"
                           value={editedProfile.grade_level ?? ""}
                           onChange={(e) => setEditedProfile({ ...editedProfile, grade_level: e.target.value })}
                           className="flex h-12 w-full rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                         >
                           <option value="">Select grade</option>
                           {GRADE_LEVELS.map((level) => (
                             <option key={level.value} value={level.value}>{level.label}</option>
                           ))}
                         </select>
                       ) : (
                         <div className="h-12 flex items-center px-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                           {profile.grade_level ? `Grade ${profile.grade_level}` : "Not set"}
                         </div>
                       )}
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school" className="text-sm font-medium text-muted-foreground">School Name</Label>
                    {isEditing ? (
                      <Input
                        id="school"
                        value={editedProfile.school_name ?? ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, school_name: e.target.value })}
                        placeholder="Enter your school name"
                        className="h-12 bg-background/50 border-border/60 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="h-12 flex items-center px-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                        {profile.school_name || "Not set"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="study_goal" className="text-sm font-medium text-muted-foreground">Study Goals</Label>
                    {isEditing ? (
                      <textarea
                        id="study_goal"
                        value={editedProfile.study_goal ?? ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, study_goal: e.target.value })}
                        placeholder="What score are you aiming for? Which colleges are you targeting?"
                        className="flex min-h-[100px] w-full rounded-lg border border-border/60 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    ) : (
                      <div className="min-h-[100px] p-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                        {profile.study_goal || "No goals set yet."}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">Bio</Label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        value={editedProfile.bio ?? ""}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        placeholder="Tell us a bit about yourself..."
                        className="flex min-h-[100px] w-full rounded-lg border border-border/60 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    ) : (
                      <div className="min-h-[100px] p-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                        {profile.bio || "No bio provided."}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                     <div className="space-y-2">
                       <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                       {isEditing ? (
                         <>
                            <Input
                              id="phone"
                              type="tel"
                              value={editedProfile.phone_number ?? ""}
                              onChange={(e) => setEditedProfile({ ...editedProfile, phone_number: e.target.value })}
                              placeholder="(123) 456-7890"
                              className={`h-12 bg-background/50 border-border/60 focus:ring-primary/20 ${fieldErrors.phone_number ? 'border-destructive' : ''}`}
                            />
                            {fieldErrors.phone_number && <p className="text-xs text-destructive">{fieldErrors.phone_number}</p>}
                         </>
                       ) : (
                         <div className="h-12 flex items-center px-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                           <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                           {profile.phone_number || "Not set"}
                         </div>
                       )}
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="parent_email" className="text-sm font-medium text-muted-foreground">Parent Email</Label>
                       {isEditing ? (
                         <>
                            <Input
                              id="parent_email"
                              type="email"
                              value={editedProfile.parent_email ?? ""}
                              onChange={(e) => setEditedProfile({ ...editedProfile, parent_email: e.target.value })}
                              placeholder="parent@example.com"
                              className={`h-12 bg-background/50 border-border/60 focus:ring-primary/20 ${fieldErrors.parent_email ? 'border-destructive' : ''}`}
                            />
                            {fieldErrors.parent_email && <p className="text-xs text-destructive">{fieldErrors.parent_email}</p>}
                         </>
                       ) : (
                         <div className="h-12 flex items-center px-4 rounded-lg bg-secondary/20 border border-border/20 text-foreground">
                           <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                           {profile.parent_email || "Not set"}
                         </div>
                       )}
                     </div>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
