"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
}

export default function DashboardAsistencia() {
    const [faltan, setFaltan] = useState<Costalero[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFaltan();

        // Suscripción en tiempo real a las asistencias
        const channel = supabase
            .channel('asistencias_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencias' }, () => {
                fetchFaltan();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchFaltan = async () => {
        // Obtenemos todos los costaleros
        const { data: costaleros } = await supabase.from("costaleros").select("*");

        // Obtenemos las asistencias de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const { data: asistencias } = await supabase
            .from("asistencias")
            .select("costalero_id")
            .eq("fecha", hoy);

        if (costaleros && asistencias) {
            const asistentesIds = asistencias.map(a => a.costalero_id);
            const noAsistentes = costaleros.filter(c => !asistentesIds.includes(c.id));
            setFaltan(noAsistentes);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white">Faltan por Llegar</h1>
                <p className="text-neutral-400">Estado en tiempo real de la cuadrilla</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7].map((t) => (
                    <div key={t} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
                        <h3 className="text-xl font-bold border-b border-neutral-800 pb-2 text-neutral-200">
                            Trabajadera {t}
                        </h3>
                        <div className="space-y-2">
                            {faltan.filter(c => c.trabajadera === t).length === 0 ? (
                                <p className="text-xs text-green-500 font-bold uppercase tracking-tighter">
                                    ✓ Cuadrilla completa
                                </p>
                            ) : (
                                faltan.filter(c => c.trabajadera === t).map(c => (
                                    <div key={c.id} className="flex justify-between items-center p-2 bg-neutral-950 rounded border border-neutral-800">
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none">{c.nombre} {c.apellidos}</p>
                                            <p className="text-[10px] text-neutral-500 uppercase mt-1">{c.puesto}</p>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
