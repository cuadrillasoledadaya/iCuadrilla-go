"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 animate-in fade-in duration-700 bg-background">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="relative p-6 bg-white rounded-[32px] shadow-xl border border-primary/5">
                    <WifiOff size={64} className="text-primary" />
                </div>
            </div>

            <div className="space-y-3 max-w-xs">
                <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter italic">
                    Sin Conexión
                </h1>
                <p className="text-neutral-500 font-medium text-sm leading-relaxed">
                    Parece que has perdido la conexión a internet. No te preocupes, iCuadrilla sigue aquí contigo.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full max-w-xs pt-4">
                <Button
                    onClick={() => window.location.reload()}
                    className="h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2"
                >
                    <RefreshCw size={20} />
                    REINTENTAR
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="h-14 border-black/5 bg-white text-neutral-900 font-black text-lg rounded-2xl shadow-sm transition-all active:scale-95 gap-2"
                >
                    <Home size={20} />
                    IR AL INICIO
                </Button>
            </div>

            <div className="pt-8">
                <p className="text-[10px] text-neutral-300 font-black uppercase tracking-[0.2em]">
                    Modo Offline Mejorado v1.1
                </p>
            </div>
        </div>
    );
}
