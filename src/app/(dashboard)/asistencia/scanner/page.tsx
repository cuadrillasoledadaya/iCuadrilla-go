"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSearchParams } from "next/navigation";

export default function AsistenciaScanner() {
    const searchParams = useSearchParams();
    const eventoId = searchParams.get("evento");
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        const initializeScanner = async () => {
            // Prevenir doble inicialización
            if (scannerRef.current) return;

            try {
                // Crear instancia
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;

                // Configuración de arranque
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                // Iniciar cámara trasera explícitamente
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

        // Pequeño delay para asegurar que el DOM está listo
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
        // Pausar escaneo al detectar éxito
        if (scannerRef.current) {
            scannerRef.current.pause();
        }
        setScanResult(decodedText);
        registrarAsistencia(decodedText);
    };

    const onScanError = (errorMessage: string) => {
        // Ignorar errores de "no QR found"
    };

    const registrarAsistencia = async (qrCode: string) => {
        setLoading(true);
        setMessage("Buscando costalero...");

        // 1. Buscar costalero por QR
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

        // 2. Registrar asistencia
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
                setMessage(`Info: ${costalero.nombre} ya estaba registrado en este evento.`);
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

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h2 className="text-xl font-bold text-center text-primary">Escáner de Asistencia</h2>

            {/* Contenedor del scanner */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 relative min-h-[300px] flex flex-col justify-center">
                {!hasPermission && hasPermission !== null && (
                    <div className="text-white text-center p-4">
                        <p className="mb-2">⚠️</p>
                        <p>Se requiere permiso de cámara</p>
                    </div>
                )}
                <div id="reader" className="w-full h-full"></div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-xl text-center font-bold text-sm animate-in fade-in slide-in-from-bottom-4 transition-all",
                    message.includes("Error") || message.includes("no reconocido")
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-green-50 text-green-700 border border-green-100"
                )}>
                    {message}
                </div>
            )}

            {scanResult && (
                <Button
                    onClick={handleReset}
                    className="w-full h-12 rounded-xl text-md font-bold shadow-lg"
                >
                    Escanear Siguiente
                </Button>
            )}
            {!scanResult && !loading && (
                <p className="text-center text-xs text-neutral-400 uppercase tracking-widest mt-4">
                    Enfoca el código QR
                </p>
            )}
        </div>
    );
}
