"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { QrCode, RefreshCcw, Camera } from "lucide-react";

// Sub-componente que usa useSearchParams
function ScannerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const eventoId = searchParams.get("evento");
    const { isAdmin, loading: roleLoading } = useUserRole();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);

    const initializeScanner = async () => {
        if (!isAdmin || isInitializing) return;

        setIsInitializing(true);
        setHasPermission(null);

        // Limpiar instancia previa si existe
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {
                console.error("Error clearing scanner:", e);
            }
            scannerRef.current = null;
        }

        try {
            // Esperar un poco para asegurar que el DOM está listo
            await new Promise(resolve => setTimeout(resolve, 300));

            const readerElement = document.getElementById("reader");
            if (!readerElement) {
                throw new Error("Elemento 'reader' no encontrado en el DOM");
            }

            const html5QrCode = new Html5Qrcode("reader");
            scannerRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanError
            );

            if (mountedRef.current) {
                setHasPermission(true);
                setIsInitializing(false);
            }
        } catch (err) {
            console.error("Error starting scanner:", err);
            if (mountedRef.current) {
                setHasPermission(false);
                setIsInitializing(false);
                setMessage("Error: No se pudo acceder a la cámara. Verifique permisos.");
            }
        }
    };

    useEffect(() => {
        mountedRef.current = true;

        if (!roleLoading && isAdmin) {
            const timer = setTimeout(() => {
                initializeScanner();
            }, 500);
            return () => {
                clearTimeout(timer);
                mountedRef.current = false;
                if (scannerRef.current) {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current?.clear();
                    }).catch(console.error);
                    scannerRef.current = null;
                }
            };
        }

        return () => {
            mountedRef.current = false;
        };
    }, [roleLoading, isAdmin]);

    const onScanSuccess = (decodedText: string) => {
        if (scannerRef.current) {
            scannerRef.current.pause();
        }
        setScanResult(decodedText);
        registrarAsistencia(decodedText);
    };

    const onScanError = (errorMessage: string) => {
        // Silenciar errores comunes de escaneo (no detección de QR)
    };

    const registrarAsistencia = async (qrCode: string) => {
        setLoading(true);
        setMessage("Buscando costalero...");

        const { data: costalero, error: searchError } = await supabase
            .from("costaleros")
            .select("id, nombre, apellidos")
            .eq("qr_code", qrCode)
            .single();

        if (searchError || !costalero) {
            setMessage("Código QR no reconocido.");
            setLoading(false);
            return;
        }

        if (!eventoId) {
            setMessage("Error: No se ha especificado el evento.");
            setLoading(false);
            return;
        }

        const { data: existing, error: checkError } = await supabase
            .from("asistencias")
            .select("estado")
            .eq("costalero_id", costalero.id)
            .eq("evento_id", eventoId)
            .maybeSingle();

        if (existing) {
            setMessage(`Info: ${costalero.nombre} ya registrado (${existing.estado?.toUpperCase()}).`);
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase
            .from("asistencias")
            .insert([{
                costalero_id: costalero.id,
                evento_id: eventoId,
                estado: "presente",
                fecha: new Date().toISOString().split('T')[0]
            }]);

        if (insertError) {
            setMessage(`Error al registrar: ${insertError.message}`);
        } else {
            setMessage(`¡Asistencia: ${costalero.nombre} ${costalero.apellidos}!`);
        }
        setLoading(false);
    };

    const handleReset = () => {
        setScanResult(null);
        setMessage("");
        setLoading(false);
        if (scannerRef.current) {
            scannerRef.current.resume();
        }
    };

    if (!roleLoading && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-6">
                <div className="p-4 bg-red-50 rounded-full text-red-500">
                    <QrCode size={48} />
                </div>
                <h2 className="text-xl font-black text-neutral-900">Acceso Restringido</h2>
                <p className="text-neutral-500">Lo sentimos, esta función es exclusiva para administradores y capataces.</p>
                <Button onClick={() => router.push('/dashboard')} variant="outline">Volver al Inicio</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 space-y-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-center text-primary uppercase tracking-tight">Escáner de Asistencia</h2>

            <div className="bg-black rounded-[32px] overflow-hidden shadow-2xl border border-neutral-800 relative min-h-[300px] flex flex-col justify-center animate-in zoom-in duration-300">
                {isInitializing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                        <RefreshCcw className="animate-spin text-white mb-2" size={32} />
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Iniciando Cámara...</p>
                    </div>
                )}

                {hasPermission === false && (
                    <div className="text-white text-center p-6 space-y-4 z-20">
                        <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                            <Camera size={24} className="text-red-500" />
                        </div>
                        <p className="font-bold text-sm">No se puede acceder a la cámara</p>
                        <p className="text-[10px] text-neutral-400">Verifica que el navegador tenga permiso para usar la cámara y actualiza la página.</p>
                        <Button
                            onClick={initializeScanner}
                            className="bg-white text-black font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-neutral-200 transition-colors"
                        >
                            <RefreshCcw size={14} className="mr-2" />
                            Reintentar Cámara
                        </Button>
                    </div>
                )}
                <div id="reader" className="w-full h-full"></div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-2xl text-center font-bold text-xs animate-in fade-in slide-in-from-bottom-4 transition-all shadow-sm border",
                    message.includes("Error") || message.includes("no reconocido")
                        ? "bg-red-50 text-red-600 border-red-100"
                        : message.includes("Info")
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-green-50 text-green-700 border-green-100"
                )}>
                    {message}
                </div>
            )}

            {scanResult ? (
                <Button
                    onClick={handleReset}
                    className="w-full h-14 rounded-2xl text-md font-black shadow-lg uppercase bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all"
                >
                    <RefreshCcw size={18} className="mr-2" />
                    Escanear Siguiente
                </Button>
            ) : (
                <div className="space-y-4">
                    {!isInitializing && (
                        <p className="text-center text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">
                            Enfoca el código QR del costalero
                        </p>
                    )}
                    <Button
                        onClick={initializeScanner}
                        variant="ghost"
                        className="w-full text-neutral-400 hover:text-neutral-900 text-[10px] font-black uppercase tracking-widest"
                    >
                        ¿No carga? Reintentar cámara
                    </Button>
                </div>
            )}
        </div>
    );
}

// Página principal envuelta en Suspense
export default function AsistenciaScanner() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <ScannerContent />
        </Suspense>
    );
}
