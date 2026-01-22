"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert } from "lucide-react";
import Image from "next/image";

const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutos en milisegundos

export function SessionTimeout() {
    const router = useRouter();
    const [isExpiring, setIsExpiring] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = "/";
        } catch (error) {
            console.error("Error automatic sign-out:", error);
            window.location.href = "/";
        }
    };

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            setIsExpiring(true);
            handleSignOut();
        }, INACTIVITY_LIMIT);
    };

    useEffect(() => {
        // Eventos a monitorizar
        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click"
        ];

        // Verificar si hay sesión activa antes de poner el timer
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                resetTimer();
                events.forEach((event) => {
                    window.addEventListener(event, resetTimer);
                });
            }
        };

        checkSession();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, []);

    if (!isExpiring) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-4">
                    <ShieldAlert className="text-red-500" size={48} />
                </div>
            </div>
            <div className="space-y-4 max-w-xs">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Sesión Caducada</h3>
                <p className="text-neutral-400 text-sm font-medium leading-relaxed">
                    Por seguridad, tu sesión se ha cerrado tras 10 minutos de inactividad.
                </p>
                <div className="pt-4">
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
