"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AsistenciaScanner() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Evitar doble inicialización
        if (scannerRef.current) {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
            /* verbose= */ false
        );

        scannerRef.current = scanner;

        function onScanSuccess(decodedText: string) {
            // Limpiar inmediatamente al detectar
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => console.error("Error clearing scanner:", err));
                scannerRef.current = null;
            }
            setScanResult(decodedText);
            registrarAsistencia(decodedText);
        }

        function onScanError(err: any) {
            // Ignorar errores de escaneo continuo
        }

        scanner.render(onScanSuccess, onScanError);

        // Cleanup robusto al desmontar
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => console.error("Error clearing scanner on unmount:", err));
                scannerRef.current = null;
            }
        };
    }, []);

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

        // 2. Registrar asistencia
        const { error: insertError } = await supabase
            .from("asistencias")
            .insert([{
                costalero_id: costalero.id,
                estado: "presente",
                fecha: new Date().toISOString().split('T')[0]
            }]);

        if (insertError) {
            if (insertError.code === '23505') {
                setMessage(`Info: ${costalero.nombre} ya estaba registrado hoy.`);
            } else {
                setMessage(`Error al registrar: ${insertError.message}`);
            }
        } else {
            setMessage(`¡Asistencia registrada: ${costalero.nombre} ${costalero.apellidos}!`);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <h2 className="text-xl font-bold text-center text-primary">Escáner de Asistencia</h2>

            {/* Contenedor del scanner con estilo mejorado */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 relative min-h-[300px]">
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
                    onClick={() => window.location.reload()}
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
