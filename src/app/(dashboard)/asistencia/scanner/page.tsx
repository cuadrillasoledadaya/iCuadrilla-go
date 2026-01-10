"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AsistenciaScanner() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanError);

        async function onScanSuccess(decodedText: string) {
            scanner.clear();
            setScanResult(decodedText);
            await registrarAsistencia(decodedText);
        }

        function onScanError(err: any) {
            // Ignorar errores de escaneo continuo
        }

        return () => {
            scanner.clear();
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

        // 2. Registrar asistencia (simplificado: asume temporada activa)
        const { error: insertError } = await supabase
            .from("asistencias")
            .insert([{
                costalero_id: costalero.id,
                estado: "presente",
                fecha: new Date().toISOString().split('T')[0]
            }]);

        if (insertError) {
            setMessage(`Error: ${costalero.nombre} ya tiene registrada su asistencia hoy.`);
        } else {
            setMessage(`¡Asistencia registrada: ${costalero.nombre} ${costalero.apellidos}!`);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-6 space-y-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h2 className="text-xl font-bold text-center text-white">Escáner de Asistencia</h2>

            <div id="reader" className="overflow-hidden rounded-lg border-2 border-dashed border-neutral-700"></div>

            {message && (
                <div className={`p-4 rounded-md text-center font-medium ${message.includes("Error") || message.includes("no reconocido") ? "bg-red-900/40 text-red-400" : "bg-green-900/40 text-green-400"
                    }`}>
                    {message}
                </div>
            )}

            {scanResult && (
                <Button
                    onClick={() => window.location.reload()}
                    className="w-full bg-white text-black font-bold"
                >
                    Escanear Siguiente
                </Button>
            )}

            <div className="mt-8 space-y-2">
                <p className="text-xs text-neutral-500 text-center uppercase tracking-widest">
                    Enfoque el código QR del costalero
                </p>
            </div>
        </div>
    );
}
