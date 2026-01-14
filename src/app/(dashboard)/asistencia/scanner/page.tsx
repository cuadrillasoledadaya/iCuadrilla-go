"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { QrCode } from "lucide-react";

// Sub-componente que usa useSearchParams
function ScannerContent() {
    const searchParams = useSearchParams();
    const router = useRouter(); // Asegurarse de importar useRouter arriba si no existe
    const eventoId = searchParams.get("evento");
    const { isCostalero, loading: roleLoading } = useUserRole();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (roleLoading) return;
        if (isCostalero) {
            // Redirigir o bloquear
            // Podemos redirigir al dashboard
            return;
        }

        mountedRef.current = true;

        // ... rest of init logic only if !isCostalero
        const initializeScanner = async () => {
            if (scannerRef.current) return;
            try {
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    onScanSuccess,
                    onScanError
                );
                if (mountedRef.current) setHasPermission(true);
            } catch (err) {
                console.error("Error starting scanner:", err);
                if (mountedRef.current) {
                    setHasPermission(false);
                    setMessage("Error: No se pudo acceder a la cámara. Verifique permisos.");
                }
            }
        };

        const timer = setTimeout(() => {
            initializeScanner();
        }, 500);

        return () => {
            mountedRef.current = false;
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(console.error);
                scannerRef.current = null;
            }
        };
    }, []);

    const onScanSuccess = (decodedText: string) => {
        if (scannerRef.current) {
            scannerRef.current.pause();
        }
        setScanResult(decodedText);
        registrarAsistencia(decodedText);
    };

    const onScanError = (errorMessage: string) => { };

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

        // 1. Verificar si ya existe un registro para este evento
        const { data: existing, error: checkError } = await supabase
            .from("asistencias")
            .select("estado")
            .eq("costalero_id", costalero.id)
            .eq("evento_id", eventoId)
            .maybeSingle();

        if (checkError) {
            console.error("Error checking existence:", checkError);
        }

        if (existing) {
            setMessage(`Info: ${costalero.nombre} ya estaba registrado en este evento (Estado: ${existing.estado?.toUpperCase()}).`);
            setLoading(false);
            return;
        }

        // 2. Si no existe, registrar
        const { error: insertError } = await supabase
            .from("asistencias")
            .insert([{
                costalero_id: costalero.id,
                evento_id: eventoId,
                estado: "presente",
                fecha: new Date().toISOString().split('T')[0]
            }]);

        if (insertError) {
            if (insertError.code === '23505') {
                setMessage(`Info: ${costalero.nombre} ya estaba registrado.`);
            } else {
                setMessage(`Error al registrar: ${insertError.message}`);
            }
        } else {
            setMessage(`¡Asistencia registrada: ${costalero.nombre} ${costalero.apellidos}!`);
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

    if (!roleLoading && isCostalero) {
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
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h2 className="text-xl font-bold text-center text-primary uppercase tracking-tight">Escáner de Asistencia</h2>

            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 relative min-h-[300px] flex flex-col justify-center">
                {!hasPermission && hasPermission !== null && (
                    <div className="text-white text-center p-4">
                        <p className="mb-2 text-2xl">⚠️</p>
                        <p className="font-bold">Se requiere permiso de cámara</p>
                    </div>
                )}
                <div id="reader" className="w-full h-full"></div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-xl text-center font-bold text-sm animate-in fade-in slide-in-from-bottom-4 transition-all",
                    message.includes("Error") || message.includes("no reconocido")
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : message.includes("Info")
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-green-50 text-green-700 border border-green-100"
                )}>
                    {message}
                </div>
            )}

            {scanResult && (
                <Button
                    onClick={handleReset}
                    className="w-full h-14 rounded-2xl text-md font-black shadow-lg uppercase"
                >
                    Escanear Siguiente
                </Button>
            )}
            {!scanResult && !loading && (
                <p className="text-center text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-4">
                    Enfoca el código QR del costalero
                </p>
            )}
        </div>
    );
}

// Página principal envuelta en Suspense
export default function AsistenciaScanner() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <ScannerContent />
        </Suspense>
    );
}
