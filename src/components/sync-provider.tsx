"use client";

import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getSyncQueue, removeFromSyncQueue } from "@/lib/offline-utils";

export function SyncProvider({ children }: { children: React.ReactNode }) {
    const isSyncing = useRef(false);

    const processQueue = useCallback(async () => {
        if (isSyncing.current || !navigator.onLine) return;

        const queue = getSyncQueue();
        if (queue.length === 0) return;

        isSyncing.current = true;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Sync] Processing ${queue.length} pending actions...`);
        }

        for (const action of queue) {
            try {
                if (action.type === 'attendance_update') {
                    const { payload } = action;

                    if (payload.isDelete) {
                        await supabase
                            .from("asistencias")
                            .delete()
                            .eq("costalero_id", payload.costalero_id)
                            .eq("evento_id", payload.evento_id);
                    } else {
                        await supabase
                            .from("asistencias")
                            .upsert({
                                costalero_id: payload.costalero_id,
                                evento_id: payload.evento_id,
                                estado: payload.estado
                            }, {
                                onConflict: 'costalero_id,evento_id'
                            });
                    }

                    removeFromSyncQueue(action.id);
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[Sync] Action ${action.id} synced successfully.`);
                    }
                }
            } catch (error) {
                console.error(`[Sync] Failed to sync action ${action.id}:`, error);
                // Keep in queue for next attempt
                break;
            }
        }

        isSyncing.current = false;
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            if (process.env.NODE_ENV === 'development') {
                console.log("[Sync] Connection restored, processing queue...");
            }
            processQueue();
        };

        window.addEventListener("online", handleOnline);

        // Periodic check (every 30 seconds if online)
        const interval = setInterval(processQueue, 30000);

        // Initial check
        processQueue();

        return () => {
            window.removeEventListener("online", handleOnline);
            clearInterval(interval);
        };
    }, [processQueue]);

    return <>{children}</>;
}
