"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Plus, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface Temporada {
    id: string;
    nombre: string;
    activa: boolean;
}

export default function GestionTemporadas() {
    const router = useRouter();
    const { isAdmin, isMaster } = useUserRole();
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [nuevaTemporada, setNuevaTemporada] = useState("");
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchTemporadas();
    }, []);

    const fetchTemporadas = async () => {
        setLoading(true);
        const { data } = await supabase.from("temporadas").select("*").order("created_at", { ascending: false });
        if (data) setTemporadas(data);
        setLoading(false);
    };

    const handleActivar = async (id: string) => {
        if (!isAdmin && !isMaster) {
            alert("No tienes permisos para realizar esta acción.");
            return;
        }
        if (!confirm("¿Estás seguro de cambiar la temporada activa?")) return;

        // Desactivar todas
        await supabase.from("temporadas").update({ activa: false }).neq("id", "00000000-0000-0000-0000-000000000000"); // Hack to update all rows if no restrictive policy
        // Activar la seleccionada
        await supabase.from("temporadas").update({ activa: true }).eq("id", id);

        fetchTemporadas();
    };

    const crearYClonar = async () => {
        if (!isAdmin && !isMaster) return;
        if (!nuevaTemporada.trim()) return;
        setCreating(true);

        try {
            // 1. Obtener la temporada activa ACTUAL (antes de desactivar)
            // Esto servirá de base para clonar datos
            const { data: oldSeason } = await supabase
                .from("temporadas")
                .select("id")
                .eq("activa", true)
                .single();

            // 2. Desactivar resto
            await supabase.from("temporadas").update({ activa: false }).neq("id", "00000000-0000-0000-0000-000000000000");

            // 3. Crear nueva temporada
            const { data: newSeason, error: tempError } = await supabase
                .from("temporadas")
                .insert([{ nombre: nuevaTemporada, activa: true }])
                .select()
                .single();

            if (tempError) throw tempError;

            // 4. CLONAR DATOS
            // A. Perfil de seccion (Datos Palio)
            if (oldSeason) {
                const { data: oldProfile } = await supabase
                    .from("perfil_trabajaderas")
                    .select("trabajadera, altura_cm")
                    .eq("temporada_id", oldSeason.id);

                if (oldProfile && oldProfile.length > 0) {
                    const newProfileRows = oldProfile.map(p => ({
                        temporada_id: newSeason.id,
                        trabajadera: p.trabajadera,
                        altura_cm: p.altura_cm
                    }));

                    const { error: cloneError } = await supabase
                        .from("perfil_trabajaderas")
                        .insert(newProfileRows);

                    if (cloneError) console.error("Error clonando perfil:", cloneError);
                }
            }

            // B. Costaleros
            // Los costaleros son una tabla global ("maestra") en este diseño, por lo que 
            // no requieren clonación. Permanecen disponibles para la nueva temporada automáticamente.
            // Sus campos 'trabajadera' y 'puesto' son el estado actual.

            alert(`Temporada ${nuevaTemporada} creada y activada correctamente.\n\nDatos del palio migrados desde la temporada anterior.`);
            setNuevaTemporada("");
            fetchTemporadas();
        } catch (e: unknown) {
            alert("Error al crear la temporada: " + (e as Error).message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white border border-black/5 rounded-full hover:bg-neutral-100 transition-colors"
                >
                    <ArrowLeft size={20} className="text-neutral-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-black uppercase tracking-tight text-neutral-900 line-clamp-1">
                        Control de Temporadas
                    </h1>
                </div>
            </header>

            <div className="p-6 space-y-8">
                {/* Crear Nueva */}
                {(isAdmin || isMaster) && (
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">Nueva Temporada</h2>
                        </div>

                        <div className="flex gap-3">
                            <Input
                                placeholder="Ej: 2026, 2027..."
                                value={nuevaTemporada}
                                onChange={(e) => setNuevaTemporada(e.target.value)}
                                className="h-12 rounded-xl border-black/10 bg-neutral-50 font-bold uppercase tracking-wider text-neutral-900"
                            />
                            <Button
                                onClick={crearYClonar}
                                disabled={!nuevaTemporada.trim() || creating}
                                className="h-12 px-6 rounded-xl bg-neutral-900 text-white font-black uppercase tracking-widest hover:bg-black transition-colors"
                            >
                                {creating ? "Creando..." : "Crear"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* History Section */}
                <div>
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4 px-2">Historial</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div></div>
                        ) : temporadas.map(t => (
                            <div
                                key={t.id}
                                className={cn(
                                    "relative p-5 rounded-[24px] border transition-all duration-300 flex items-center justify-between group",
                                    t.activa
                                        ? "bg-white border-primary shadow-lg scale-[1.02] z-10"
                                        : "bg-white/50 border-black/5 hover:bg-white hover:border-black/10 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 rounded-2xl flex items-center justify-center transition-colors",
                                        t.activa ? "bg-primary text-white shadow-md" : "bg-neutral-100 text-neutral-400"
                                    )}>
                                        {t.activa ? <Trophy size={20} /> : <Calendar size={20} />}
                                    </div>
                                    <div>
                                        <h4 className={cn(
                                            "text-lg font-black uppercase tracking-tight",
                                            t.activa ? "text-neutral-900" : "text-neutral-500"
                                        )}>{t.nombre}</h4>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1",
                                            t.activa ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-400"
                                        )}>
                                            {t.activa ? "Temporada Activa" : "Finalizada"}
                                        </span>
                                    </div>
                                </div>

                                {!t.activa && (
                                    <button
                                        onClick={() => handleActivar(t.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all transform translate-x-4 group-hover:translate-x-0"
                                    >
                                        Activar
                                    </button>
                                )}

                                {t.activa && (
                                    <div className="absolute top-0 right-0 p-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
