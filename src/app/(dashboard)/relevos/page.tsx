"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    posicion_trabajadera: number;
    puesto: string;
}

export default function GestionRelevos() {
    const [costaleros, setCostaleros] = useState<Costalero[]>([]);
    const [selected, setSelected] = useState<Costalero | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCostaleros();
    }, []);

    const fetchCostaleros = async () => {
        const { data } = await supabase.from("costaleros").select("*").order("trabajadera").order("posicion_trabajadera");
        if (data) setCostaleros(data);
        setLoading(false);
    };

    const handleSelect = async (c: Costalero) => {
        if (!selected) {
            setSelected(c);
            return;
        }

        if (selected.id === c.id) {
            setSelected(null);
            return;
        }

        // Lógica de intercambio (Swap)
        setLoading(true);

        // Actualización en paralelo en la DB
        const update1 = supabase.from("costaleros").update({
            trabajadera: c.trabajadera,
            posicion_trabajadera: c.posicion_trabajadera
        }).eq("id", selected.id);

        const update2 = supabase.from("costaleros").update({
            trabajadera: selected.trabajadera,
            posicion_trabajadera: selected.posicion_trabajadera
        }).eq("id", c.id);

        await Promise.all([update1, update2]);

        setSelected(null);
        await fetchCostaleros();
        setLoading(false);
    };

    const getCostaleroByPos = (t: number, p: number) => {
        return costaleros.find(c => c.trabajadera === t && c.posicion_trabajadera === p);
    };

    return (
        <div className="p-6 space-y-8 bg-background min-h-screen pb-32">
            <header className="relative flex flex-col items-center justify-center min-h-[64px] text-center">
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Gestión de Relevos</h1>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Selecciona dos para intercambiar</p>
                {selected && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-primary/20">
                        Intercambiar con: {selected.nombre}
                    </div>
                )}
            </header>

            <div className="overflow-x-auto pb-4">
                <div className="inline-grid grid-cols-7 gap-3 min-w-[800px]">
                    {[1, 2, 3, 4, 5, 6, 7].map(t => (
                        <div key={t} className="space-y-3">
                            <div className="text-center font-bold text-neutral-500 text-xs uppercase tracking-widest mb-2">
                                Trab. {t}
                            </div>
                            {[1, 2, 3, 4, 5].map(p => {
                                const c = getCostaleroByPos(t, p);
                                return (
                                    <button
                                        key={`${t}-${p}`}
                                        disabled={loading}
                                        onClick={() => c && handleSelect(c)}
                                        className={cn(
                                            "h-24 w-full rounded-md border text-left p-2 transition-all flex flex-col justify-between",
                                            !c ? "bg-neutral-900/50 border-neutral-800 border-dashed cursor-default" :
                                                selected?.id === c.id ? "bg-white border-white text-black scale-105 z-10 shadow-xl shadow-white/20" :
                                                    "bg-neutral-900 border-neutral-800 hover:border-neutral-500 text-white"
                                        )}
                                    >
                                        <div className="text-[10px] uppercase font-bold text-neutral-500">
                                            Hueco {p}
                                        </div>
                                        {c ? (
                                            <div>
                                                <div className="text-xs font-bold leading-tight line-clamp-2">
                                                    {c.nombre} {c.apellidos}
                                                </div>
                                                <div className={cn(
                                                    "text-[9px] uppercase mt-1",
                                                    selected?.id === c.id ? "text-neutral-600" : "text-neutral-500"
                                                )}>
                                                    {c.puesto || "Costalero"}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-neutral-700 italic">Vacío</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                <h3 className="text-xs font-bold uppercase text-neutral-500 mb-2">Instrucciones</h3>
                <ul className="text-[11px] text-neutral-400 space-y-1 list-disc pl-4">
                    <li>Toca a un costalero para seleccionarlo.</li>
                    <li>Toca a otro costalero para intercambiar sus posiciones en el paso.</li>
                    <li>Los cambios se guardan automáticamente en tiempo real.</li>
                </ul>
            </div>
        </div>
    );
}
