"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    AlertTriangle,
    Save
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BajaCostalero() {
    const router = useRouter();
    const params = useParams();
    const [costalero, setCostalero] = useState<any>(null);
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCostalero = async () => {
            const { data } = await supabase
                .from("costaleros")
                .select("id, nombre, apellidos, apodo")
                .eq("id", params.id)
                .single();
            if (data) setCostalero(data);
            setLoading(false);
        };
        fetchCostalero();
    }, [params.id]);

    const handleBaja = async () => {
        if (!motivo.trim()) {
            alert("Por favor, introduce el motivo de la baja.");
            return;
        }
        setSaving(true);

        try {
            // 1. Obtener temporada activa
            const { data: temporadaActiva } = await supabase
                .from("temporadas")
                .select("id")
                .eq("activa", true)
                .single();

            if (!temporadaActiva) throw new Error("No hay una temporada activa configurada.");

            // 2. Registrar movimiento de baja
            const { error: moveError } = await supabase
                .from("movimientos_cuadrilla")
                .insert([{
                    costalero_id: params.id,
                    temporada_id: temporadaActiva.id,
                    tipo: 'baja',
                    motivo: motivo
                }]);

            if (moveError) throw moveError;

            // 3. Actualizar estado del costalero
            const { error: updateError } = await supabase
                .from("costaleros")
                .update({ estado: 'baja' })
                .eq("id", params.id);

            if (updateError) throw updateError;

            alert("Baja tramitada correctamente.");
            router.push('/cuadrilla');
            router.refresh();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 pb-32 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative p-6 flex items-center justify-center">
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 p-3 bg-neutral-900/50 border border-white/5 rounded-2xl text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-1">
                    <h1 className="text-lg font-black tracking-tight uppercase text-white tracking-[0.2em]">Tramitar Baja</h1>
                </div>
            </header>

            <main className="px-6 space-y-8">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle size={24} />
                        <h2 className="text-xl font-black uppercase tracking-tight italic">Advertencia</h2>
                    </div>
                    <p className="text-xs text-red-400 font-medium leading-relaxed">
                        Estás a punto de tramitar la baja de <span className="font-black underline text-white">
                            {costalero?.apodo ? `${costalero.apodo} (${costalero.nombre})` : `${costalero?.nombre} ${costalero?.apellidos}`}
                        </span>. Esta acción lo retirará del listado activo de la cuadrilla.
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Motivo de la Baja</label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Motivos laborales, salud, decisión personal..."
                        className="w-full bg-neutral-900 border border-white/5 rounded-[24px] p-5 text-sm text-white focus:border-primary/50 transition-colors min-h-[150px] outline-none"
                    />
                </div>

                <Button
                    onClick={handleBaja}
                    disabled={saving || !motivo.trim()}
                    className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-[24px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Save size={20} />
                    {saving ? "Tramitando..." : "Confirmar Baja"}
                </Button>
            </main>
        </div>
    );
}
