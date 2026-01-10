"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Posicion {
    id: string;
    nombre: string;
    trabajadera: number;
    costalero_nombre?: string;
}

export default function GestionRelevos() {
    const params = useParams();
    const router = useRouter();
    const [relevos, setRelevos] = useState<Posicion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const mocked: Posicion[] = [
            { id: '1', nombre: 'PATERO IZQ', trabajadera: 1, costalero_nombre: 'Susino Susino' },
            { id: '2', nombre: 'PATERO DER', trabajadera: 1 },
            { id: '3', nombre: 'FIJADOR IZQ', trabajadera: 1 },
            { id: '4', nombre: 'FIJADOR DER', trabajadera: 1 },
            { id: '5', nombre: 'CORRIENTE', trabajadera: 1 },
            { id: '6', nombre: 'COSTERO IZQ', trabajadera: 2 },
            { id: '7', nombre: 'COSTERO DER', trabajadera: 2 },
        ];
        setRelevos(mocked);
        setLoading(false);
    }, [params.id]);

    const ocupadas = relevos.filter(r => r.costalero_nombre).length;
    const total = 35;
    const pct = (ocupadas / total) * 100;

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen pb-32 bg-[#FAFAFA] animate-in fade-in duration-700">
            {/* Top Bar */}
            <div className="p-6 pb-0 space-y-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Gestión Relevos</h1>
                    </div>
                </header>

                <div className="flex justify-between items-center bg-white p-3 rounded-3xl border border-black/5 shadow-sm">
                    <button className="px-8 h-12 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                        Salida
                    </button>
                    <button className="p-3 bg-neutral-50 rounded-2xl text-primary hover:bg-primary/5 transition-colors border border-black/5">
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* Occupancy Header */}
            <div className="mt-8 p-10 bg-white space-y-5 rounded-t-[40px] border-t border-black/5 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] relative z-10">
                <div className="text-center space-y-1">
                    <h3 className="text-3xl font-black text-neutral-900 tracking-tighter italic">{ocupadas}/{total} Puestos</h3>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">{total - ocupadas} LIBRES PARA RELEVO</p>
                </div>
                <div className="h-4 w-full bg-neutral-100 rounded-full overflow-hidden border border-black/5">
                    <div
                        className="h-full bg-primary shadow-[0_0_15px_rgba(128,0,32,0.3)] transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Grid Tactical */}
            <div className="p-6 bg-white min-h-[60vh] -mt-2 overflow-hidden">
                <div className="space-y-12 pt-4">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-neutral-900 tracking-tighter italic ml-2">TRABAJADERA 1</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {relevos.filter(r => r.trabajadera === 1 && r.nombre !== 'CORRIENTE').map((pos) => (
                                <div
                                    key={pos.id}
                                    className={cn(
                                        "p-5 rounded-[24px] border-2 transition-all flex flex-col justify-center space-y-1 h-28",
                                        pos.costalero_nombre
                                            ? "bg-white border-primary/20 shadow-xl shadow-primary/5 shadow-inner"
                                            : "bg-neutral-50/50 border-dashed border-neutral-200"
                                    )}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                                        {pos.nombre}
                                    </span>
                                    <span className={cn(
                                        "font-extrabold text-sm italic",
                                        pos.costalero_nombre ? "text-primary" : "text-neutral-300 font-medium"
                                    )}>
                                        {pos.costalero_nombre || 'Asignar...'}
                                    </span>
                                </div>
                            ))}
                            {/* Corriente */}
                            <div className="col-span-2 flex justify-center pt-2">
                                {relevos.filter(r => r.nombre === 'CORRIENTE').map((pos) => (
                                    <div
                                        key={pos.id}
                                        className={cn(
                                            "w-full max-w-[240px] p-5 rounded-[24px] border-2 border-dashed transition-all flex flex-col justify-center space-y-1 h-28 text-center",
                                            pos.costalero_nombre ? "bg-white border-primary/20 shadow-xl border-solid" : "bg-neutral-50/50 border-neutral-200"
                                        )}
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{pos.nombre}</span>
                                        <span className={cn("font-extrabold text-sm italic", pos.costalero_nombre ? "text-primary" : "text-neutral-300 font-medium")}>
                                            {pos.costalero_nombre || 'Sin asignar'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
