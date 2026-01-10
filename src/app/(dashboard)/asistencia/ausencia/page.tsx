"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ComunicarAusencia() {
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const enviarAusencia = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Obtenemos el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage("Debes estar identificado para enviar una ausencia.");
            setLoading(false);
            return;
        }

        // Buscamos el costalero vinculado al user_id
        const { data: costalero } = await supabase
            .from("costaleros")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!costalero) {
            setMessage("No se encontró tu ficha de costalero.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.from("asistencias").insert([{
            costalero_id: costalero.id,
            estado: "ausente",
            motivo_ausencia: motivo,
            fecha: new Date().toISOString().split('T')[0]
        }]);

        if (error) {
            setMessage("Error al enviar la ausencia (puede que ya la hayas registrado hoy).");
        } else {
            setMessage("Ausencia comunicada correctamente al Capataz.");
            setMotivo("");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-md mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-white">Comunicar Ausencia</h1>

            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                <p className="text-sm text-neutral-400 mb-6 italic">
                    "Si no puedes asistir al ensayo o salida, comunica el motivo aquí para que el Capataz pueda jusitificarlo."
                </p>

                <form onSubmit={enviarAusencia} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-neutral-500">Motivo de la ausencia</label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            className="w-full min-h-[120px] p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
                            placeholder="Ej: Compromiso laboral, enfermedad..."
                            required
                        />
                    </div>
                    <Button disabled={loading} className="w-full bg-white text-black font-bold h-12">
                        {loading ? "Enviando..." : "Enviar a Capataces"}
                    </Button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded text-center text-xs font-bold uppercase ${message.includes("Error") ? "bg-red-900/40 text-red-500" : "bg-green-900/40 text-green-500"
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
