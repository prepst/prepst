"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/queries";
import { profileCache } from "@/lib/profile-cache";
import { useState, useEffect } from "react";

// Initialize cache synchronously to avoid flicker
const getInitialCache = () => {
  if (typeof window === 'undefined') return { photo: null, name: "" };
  const cached = profileCache.get();
  return {
    photo: cached?.profile_photo_url || null,
    name: cached?.display_name || "",
  };
};

interface ProfileDropdownProps {
  isSidebarCollapsed: boolean;
  className?: string;
}

export function ProfileDropdown({
  isSidebarCollapsed,
  className,
}: ProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const { data: profileData, isLoading } = useProfile();

  // Initialize with cached data synchronously
  const initialCache = getInitialCache();
  const [cachedProfilePhoto, setCachedProfilePhoto] = useState<string | null>(initialCache.photo);
  const [cachedDisplayName, setCachedDisplayName] = useState<string>(initialCache.name);

  // Update cache when profile data changes
  useEffect(() => {
    if (profileData?.profile) {
      const profile = profileData.profile;
      const displayName = (profile as any).name || profile.email?.split("@")[0] || "";
      const photoUrl = profile.profile_photo_url;

      profileCache.set(photoUrl || null, displayName);

      // Update state with fresh data
      if (photoUrl) setCachedProfilePhoto(photoUrl);
      if (displayName) setCachedDisplayName(displayName);
    }
  }, [profileData]);

  const getDisplayName = () => {
    // Don't show anything until profile is loaded
    if (isLoading || !profileData) {
      return "";
    }

    const profile = profileData.profile;

    // First, try the name field (new schema)
    if ((profile as any).name) {
      return (profile as any).name;
    }

    // Fall back to combining first_name and last_name (old schema)
    if ((profile as any).first_name || (profile as any).last_name) {
      return [(profile as any).first_name, (profile as any).last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
    }

    // Try full_name (old schema)
    if ((profile as any).full_name) {
      return (profile as any).full_name;
    }

    // Fall back to auth user metadata
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }

    // Only show email as last resort
    if (profile.email) {
      return profile.email.split("@")[0];
    }

    return "";
  };

  const getInitials = () => {
    if (isLoading || !profileData) {
      return "";
    }

    const name = getDisplayName();
    if (!name) return "U";

    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (name.length > 0) {
      return name[0].toUpperCase();
    }
    return "U";
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Use cached data immediately, fall back to fresh data or defaults
  const displayPhoto = cachedProfilePhoto || profileData?.profile?.profile_photo_url || "/profile.png";
  const displayName = cachedDisplayName || getDisplayName() || user?.email?.split("@")[0] || "";

  // Only show profile if we have cache OR profile data is loaded
  const hasProfileData = cachedProfilePhoto || cachedDisplayName || !isLoading;

  if (!hasProfileData) {
    return null; // Don't render anything while loading without cache
  }

  if (isSidebarCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-2xl p-0 overflow-hidden hover:bg-muted/60 transition-all duration-200"
          >
            <Image
              src={displayPhoto}
              alt="Profile"
              width={48}
              height={48}
              className="object-cover"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="pb-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center rounded-2xl transition-all duration-200 hover:bg-muted/60 text-foreground gap-3 py-0 px-4 w-full justify-between group ${className}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border/50 shadow-sm">
                <Image
                  src={displayPhoto}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email?.split("@")[0]}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
