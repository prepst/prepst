"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

const SESSION_STORAGE_KEY = "prepst_promo_popup_shown";
const FIRST_LOGIN_KEY = "prepst_first_login_shown";
const NAVIGATION_THRESHOLD = 4;
const TIME_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

// Pages where we should NOT show the popup (active sessions)
const EXCLUDED_PATHS = [
    "/practice/",
    "/mock-exam/",
    "/diagnostic-test/",
    "/onboard",
    "/login",
    "/signup",
    "/otp",
];

interface UsePremiumPopupOptions {
    isAuthenticated: boolean;
    isPremium: boolean;
}

export function usePremiumPopup({ isAuthenticated, isPremium }: UsePremiumPopupOptions) {
    const [showPopup, setShowPopup] = useState(false);
    const [navigationCount, setNavigationCount] = useState(0);
    const [hasCheckedFirstLogin, setHasCheckedFirstLogin] = useState(false);
    const pathname = usePathname();

    // Check if current path is excluded
    const isExcludedPath = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path));

    // Check if popup was already shown this session
    const wasShownThisSession = useCallback(() => {
        if (typeof window === "undefined") return true;
        return sessionStorage.getItem(SESSION_STORAGE_KEY) === "true";
    }, []);

    // Check if this is first login ever
    const isFirstLogin = useCallback(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(FIRST_LOGIN_KEY) !== "true";
    }, []);

    // Mark popup as shown
    const markAsShown = useCallback(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
            localStorage.setItem(FIRST_LOGIN_KEY, "true");
        }
    }, []);

    // Track navigation
    useEffect(() => {
        if (pathname && !isExcludedPath) {
            setNavigationCount((prev) => prev + 1);
        }
    }, [pathname, isExcludedPath]);

    // Check for first login - show popup immediately
    useEffect(() => {
        if (!isAuthenticated || isPremium || isExcludedPath || hasCheckedFirstLogin) {
            return;
        }

        setHasCheckedFirstLogin(true);

        // Show popup immediately for first-time users
        if (isFirstLogin()) {
            // Small delay to let the dashboard render first
            const timeoutId = setTimeout(() => {
                setShowPopup(true);
                markAsShown();
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [isAuthenticated, isPremium, isExcludedPath, isFirstLogin, markAsShown, hasCheckedFirstLogin]);

    // Check conditions to show popup for returning users
    useEffect(() => {
        // Don't show if:
        // - Not authenticated
        // - Already premium
        // - Excluded path (in session)
        // - Already shown this browser session
        // - First login check hasn't happened yet
        if (!isAuthenticated || isPremium || isExcludedPath || wasShownThisSession() || !hasCheckedFirstLogin) {
            return;
        }

        // Show after navigation threshold
        if (navigationCount >= NAVIGATION_THRESHOLD) {
            setShowPopup(true);
            markAsShown();
            return;
        }

        // Show after time threshold
        const timeoutId = setTimeout(() => {
            if (!wasShownThisSession() && !isExcludedPath) {
                setShowPopup(true);
                markAsShown();
            }
        }, TIME_THRESHOLD_MS);

        return () => clearTimeout(timeoutId);
    }, [
        isAuthenticated,
        isPremium,
        isExcludedPath,
        navigationCount,
        wasShownThisSession,
        markAsShown,
        hasCheckedFirstLogin,
    ]);

    const closePopup = useCallback(() => {
        setShowPopup(false);
    }, []);

    const openPopup = useCallback(() => {
        setShowPopup(true);
    }, []);

    return {
        showPopup,
        closePopup,
        openPopup,
    };
}
