/**
 * Cache Service
 * Handles persisting and retrieving application data from LocalStorage
 * to enable instant 'Stale-While-Revalidate' loading.
 */

const CACHE_KEY = 'schoolhub_data_cache';

export const CacheService = {
  /**
   * Save full application data to cache
   */
  save: (data) => {
    try {
      if (!data || typeof data !== 'object') return;
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        ...data,
        cachedAt: new Date().getTime()
      }));
    } catch (e) {
      console.warn('Failed to save to cache:', e);
    }
  },

  /**
   * Retrieve application data from cache
   */
  get: () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn('Failed to read from cache:', e);
      return null;
    }
  },

  /**
   * Clear all cached data
   */
  clear: () => {
    localStorage.removeItem(CACHE_KEY);
  }
};
