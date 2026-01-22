"use client";

/**
 * Utility to save data to localStorage with a prefix.
 */
export const saveToCache = (key: string, data: any) => {
    if (typeof window === "undefined") return;
    try {
        const cacheData = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(`icuadrilla_cache_${key}`, JSON.stringify(cacheData));
    } catch (e) {
        console.error("Error saving to cache:", e);
    }
};

/**
 * Utility to get data from localStorage.
 * Returns null if no data or if data is expired (optional).
 */
export const getFromCache = <T>(key: string, maxAgeMs?: number): T | null => {
    if (typeof window === "undefined") return null;
    try {
        const cached = localStorage.getItem(`icuadrilla_cache_${key}`);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        if (maxAgeMs && Date.now() - timestamp > maxAgeMs) {
            return null;
        }

        return data as T;
    } catch (e) {
        console.error("Error reading from cache:", e);
        return null;
    }
};
