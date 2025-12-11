/**
 * LocalStorage cache for profile data to eliminate loading flicker
 * Stores profile photo URL and display name for instant rendering
 */

interface CachedProfileData {
  profile_photo_url: string | null;
  display_name: string;
  cached_at: number;
}

const CACHE_KEY = 'sat_profile_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const profileCache = {
  /**
   * Get cached profile data from localStorage
   * Returns null if cache is expired or doesn't exist
   */
  get(): CachedProfileData | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CachedProfileData = JSON.parse(cached);

      // Check if cache is expired
      const now = Date.now();
      if (now - data.cached_at > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to read profile cache:', error);
      return null;
    }
  },

  /**
   * Save profile data to localStorage
   */
  set(profile_photo_url: string | null, display_name: string): void {
    if (typeof window === 'undefined') return;

    try {
      const data: CachedProfileData = {
        profile_photo_url,
        display_name,
        cached_at: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to write profile cache:', error);
    }
  },

  /**
   * Clear cached profile data
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear profile cache:', error);
    }
  },
};
