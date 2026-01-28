"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "prepst-onboarding-completed";

interface OnboardingContextType {
    completedPages: Set<string>;
    isPageCompleted: (pageId: string) => boolean;
    markPageComplete: (pageId: string) => void;
    resetAllOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [completedPages, setCompletedPages] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setCompletedPages(new Set(parsed));
            }
        } catch (error) {
            console.error("Failed to load onboarding state:", error);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever completedPages changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedPages]));
            } catch (error) {
                console.error("Failed to save onboarding state:", error);
            }
        }
    }, [completedPages, isLoaded]);

    const isPageCompleted = useCallback((pageId: string) => {
        return completedPages.has(pageId);
    }, [completedPages]);

    const markPageComplete = useCallback((pageId: string) => {
        setCompletedPages((prev) => {
            const next = new Set(prev);
            next.add(pageId);
            return next;
        });
    }, []);

    const resetAllOnboarding = useCallback(() => {
        setCompletedPages(new Set());
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Failed to reset onboarding state:", error);
        }
    }, []);

    return (
        <OnboardingContext.Provider
            value={{
                completedPages,
                isPageCompleted,
                markPageComplete,
                resetAllOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
