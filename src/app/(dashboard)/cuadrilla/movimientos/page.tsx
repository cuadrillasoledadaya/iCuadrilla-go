"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    History,
    TrendingUp,
    TrendingDown,
    Calendar,
    MessageSquare,
    User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Movimiento {
    id: string;
    tipo: 'alta' | 'baja';
    motivo: string;
    fecha: string;
    costalero: {
        nombre: string;
        apellidos: string;
        apodo?: string;
    };
    temporada: {
        nombre: string;
    };
}

export default function MovimientosCuadrilla() {
    const router = useRouter();
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovimientos = async () => {
            // 1. Obtener temporada activa
            const { data: temporadaActiva } = await supabase
                .from("temporadas")
                .select("id")
                .eq("activa", true)
                .single();

            if (temporadaActiva) {
                const { data } = await supabase
                    .from("movimientos_cuadrilla")
                    .select(`
                        id,
                        tipo,
                        motivo,
                        fecha,
                        costalero:costaleros(nombre, apellidos, apodo),
                        temporada:temporadas(nombre)
                    `)
                    .eq("temporada_id", temporadaActiva.id)
                    .order("fecha", { ascending: false });

                if (data) setMovimientos(data as any);
            }
            setLoading(false);
        };
        fetchMovimientos();
    }, []);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative p-6 flex items-center justify-center">
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-1">
                    <h1 className="text-lg font-black tracking-tight uppercase text-neutral-900 tracking-[0.2em]">Movimientos</h1>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">Altas y Bajas de la Temporada</p>
                </div>
            </header>

            <main className="px-6 space-y-6">
                {movimientos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-black/5 space-y-4 shadow-sm">
                        <History size={48} className="mx-auto text-neutral-100" />
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No hay movimientos registrados</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {movimientos.map((m) => (
                            <div
                                key={m.id}
                                className="bg-white border border-black/5 p-5 rounded-[28px] shadow-sm space-y-4 hover:border-primary/20 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-3 rounded-2xl",
                                            m.tipo === 'alta' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                                        )}>
                                            {m.tipo === 'alta' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                {m.tipo === 'alta' ? 'Nueva Alta' : 'Baja Tramitada'}
                                            </p>
                                            <p className="font-extrabold text-neutral-900 uppercase tracking-tight italic">
                                                {m.costalero.apodo ? (
                                                    <span className="text-primary italic">{m.costalero.apodo}</span>
                                                ) : (
                                                    `${m.costalero.nombre} ${m.costalero.apellidos}`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-50 rounded-full border border-black/5">
                                            <Calendar size={10} className="text-neutral-400" />
                                            <span className="text-[9px] font-black text-neutral-400 uppercase">
                                                {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(m.fecha))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {m.motivo && (
                                    <div className="bg-neutral-50 p-4 rounded-2xl border border-black/5 flex gap-3">
                                        <MessageSquare size={16} className="text-neutral-200 shrink-0" />
                                        <p className="text-xs text-neutral-500 leading-relaxed font-bold italic">
                                            "{m.motivo}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
