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

/**
 * Synchronization Queue Interface
 */
export interface SyncAction {
    id: string;
    type: 'attendance_update';
    payload: any;
    timestamp: number;
}

/**
 * Add an action to the sync queue.
 */
export const addToSyncQueue = (action: Omit<SyncAction, 'id' | 'timestamp'>) => {
    if (typeof window === "undefined") return;
    try {
        const queue = getSyncQueue();
        const newAction: SyncAction = {
            ...action,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        queue.push(newAction);
        localStorage.setItem('icuadrilla_sync_queue', JSON.stringify(queue));
    } catch (e) {
        console.error("Error adding to sync queue:", e);
    }
};

/**
 * Get all pending actions in the queue.
 */
export const getSyncQueue = (): SyncAction[] => {
    if (typeof window === "undefined") return [];
    try {
        const queue = localStorage.getItem('icuadrilla_sync_queue');
        return queue ? JSON.parse(queue) : [];
    } catch (e) {
        console.error("Error reading sync queue:", e);
        return [];
    }
};

/**
 * Remove an action from the queue by ID.
 */
export const removeFromSyncQueue = (id: string) => {
    if (typeof window === "undefined") return;
    try {
        const queue = getSyncQueue();
        const filtered = queue.filter(a => a.id !== id);
        localStorage.setItem('icuadrilla_sync_queue', JSON.stringify(filtered));
    } catch (e) {
        console.error("Error removing from sync queue:", e);
    }
};
