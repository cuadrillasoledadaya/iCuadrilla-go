"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        // Check initial state
        setIsOffline(!navigator.onLine);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-500">
            <div className="bg-neutral-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-center gap-3 shadow-2xl">
                <div className="bg-red-500 p-1.5 rounded-full animate-pulse shadow-lg shadow-red-500/40">
                    <WifiOff size={14} className="text-white" />
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest italic leading-none">
                        Modo Sin Conexión
                    </p>
                    <p className="text-neutral-400 text-[8px] font-bold uppercase tracking-tighter mt-1">
                        Algunas funciones pueden estar limitadas
                    </p>
                </div>
            </div>
        </div>
    );
}
