import { useRef, useCallback } from "react";

interface CacheEntry {
  data: any;
  timestamp: number;
  promise?: Promise<any>;
}

interface ApiCache {
  [key: string]: CacheEntry;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApiCache = () => {
  const cacheRef = useRef<ApiCache>({});

  const getCachedData = useCallback((key: string): any | null => {
    const entry = cacheRef.current[key];
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {
      delete cacheRef.current[key];
      return null;
    }

    return entry.data;
  }, []);

  const setCachedData = useCallback((key: string, data: any): void => {
    cacheRef.current[key] = {
      data,
      timestamp: Date.now(),
    };
  }, []);

  const getCachedPromise = useCallback((key: string): Promise<any> | null => {
    const entry = cacheRef.current[key];
    return entry?.promise || null;
  }, []);

  const setCachedPromise = useCallback(
    (key: string, promise: Promise<any>): void => {
      cacheRef.current[key] = {
        data: null,
        timestamp: Date.now(),
        promise,
      };
    },
    [],
  );

  const clearCache = useCallback((key?: string): void => {
    if (key) {
      delete cacheRef.current[key];
    } else {
      cacheRef.current = {};
    }
  }, []);

  const cachedApiCall = useCallback(
    async <T>(key: string, apiFunction: () => Promise<T>): Promise<T> => {
      // Check if we have cached data
      const cachedData = getCachedData(key);
      if (cachedData) {
        return cachedData;
      }

      // Check if there's already a pending request
      const pendingPromise = getCachedPromise(key);
      if (pendingPromise) {
        return pendingPromise;
      }

      // Make the API call
      const promise = apiFunction().then((data) => {
        setCachedData(key, data);
        return data;
      });

      // Cache the promise to prevent duplicate requests
      setCachedPromise(key, promise);

      return promise;
    },
    [getCachedData, getCachedPromise, setCachedData, setCachedPromise],
  );

  return {
    getCachedData,
    setCachedData,
    clearCache,
    cachedApiCall,
  };
};
