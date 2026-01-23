"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

// Tiempo de inactividad en milisegundos (10 minutos)
const INACTIVITY_LIMIT = 10 * 60 * 1000;
// Tiempo de advertencia antes de cerrar sesión (1 minuto antes)
const WARNING_THRESHOLD = 1 * 60 * 1000;

export function SessionTimeout() {
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const lastActivityRef = useRef<number>(Date.now());
    const router = useRouter();
    const supabase = createClient();

    // Referencia para el intervalo del temporizador de cuenta regresiva
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            router.push("/login?timeout=true");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }, [router, supabase]);

    const checkInactivity = useCallback(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        // Si ha pasado el tiempo límite, cerrar sesión
        if (timeSinceLastActivity >= INACTIVITY_LIMIT) {
            signOut();
        }
        // Si estamos en el umbral de advertencia y no se está mostrando ya
        else if (timeSinceLastActivity >= (INACTIVITY_LIMIT - WARNING_THRESHOLD)) {
            if (!showWarning) {
                setShowWarning(true);
                // Calcular tiempo restante exacto en segundos
                const remaining = Math.ceil((INACTIVITY_LIMIT - timeSinceLastActivity) / 1000);
                setTimeLeft(remaining > 0 ? remaining : 60);
            }
        }
    }, [signOut, showWarning]);

    // Función para resetear el temporizador de inactividad
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (showWarning) {
            setShowWarning(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [showWarning]);

    // Efecto para escuchar eventos de actividad
    useEffect(() => {
        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click"
        ];

        // Throttle para no ejecutar resetTimer demasiadas veces
        let timeout: NodeJS.Timeout;
        const handleActivity = () => {
            if (timeout) return;
            timeout = setTimeout(() => {
                resetTimer();
                // @ts-ignore
                timeout = null;
            }, 500);
        };

        // Agregar listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        // Intervalo para verificar inactividad periódicamente
        const intervalId = setInterval(checkInactivity, 1000);

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            clearInterval(intervalId);
            if (timeout) clearTimeout(timeout);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [resetTimer, checkInactivity]);

    // Efecto para la cuenta regresiva en el modal
    useEffect(() => {
        if (showWarning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        signOut(); // Forzar cierre si llega a 0
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [showWarning, signOut]); // Eliminado timeLeft de dependencias para evitar recrear intervalo

    const handleExtendSession = () => {
        resetTimer();
    };

    return (
        <Modal
            isOpen={showWarning}
            onClose={() => { }} // No permitir cerrar con click fuera/esc obligatoriamente
            title="Inactividad Detectada"
        >
            <div className="space-y-4">
                <p className="text-neutral-300">
                    Tu sesión expirará en <span className="text-gold font-bold">{timeLeft}</span> segundos por inactividad.
                </p>
                <p className="text-sm text-neutral-400">
                    ¿Deseas mantener tu sesión abierta?
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => signOut()}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        Cerrar Sesión
                    </Button>
                    <Button
                        onClick={handleExtendSession}
                        className="bg-gold text-black hover:bg-gold/80 font-bold"
                    >
                        Mantener Sesión
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
