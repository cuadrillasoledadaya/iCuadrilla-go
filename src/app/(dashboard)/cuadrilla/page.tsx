"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Search,
    UserPlus,
    ChevronRight,
    Users,
    Filter
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
}

export default function CuadrillaList() {
    const router = useRouter();
    const [costaleros, setCostaleros] = useState<Costalero[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedCostalero, setSelectedCostalero] = useState<string | null>(null);

    useEffect(() => {
        const fetchCuadrilla = async () => {
            const { data } = await supabase.from("costaleros")
                .select("*")
                .eq("rol", "costalero")
                .order("trabajadera", { ascending: true })
                .order("apellidos", { ascending: true });
            if (data) setCostaleros(data);
            setLoading(false);
        };
        fetchCuadrilla();
    }, []);

    const filtered = costaleros.filter(c =>
        `${c.nombre} ${c.apellidos}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tighter uppercase text-neutral-900 italic">La Cuadrilla</h1>
                    <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">Listado de Hermanos Costaleros</p>
                </div>
                <button
                    onClick={() => router.push('/costaleros/nuevo')}
                    className="absolute right-0 p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 active:scale-90 transition-all"
                >
                    <UserPlus size={24} />
                </button>
            </header>

            {/* Búsqueda y Filtros */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <Input
                        placeholder="Buscar por nombre..."
                        className="bg-white pl-12 h-14 border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="p-4 bg-white border border-black/5 shadow-sm rounded-2xl text-neutral-400 hover:text-primary transition-colors">
                    <Filter size={24} />
                </button>
            </div>

            {/* Listado */}
            <div className="space-y-8">
                {Array.from({ length: 7 }, (_, i) => i + 1).map((t) => {
                    const costalerosInTrabajadera = filtered.filter(c => c.trabajadera === t);
                    if (costalerosInTrabajadera.length === 0) return null;

                    return (
                        <div key={t} className="space-y-4">
                            {/* Sticky Header */}
                            <div className="sticky top-0 z-20 py-2 -mx-6 px-6 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-black/5">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-black tracking-widest uppercase text-primary italic">Trabajadera {t}</h2>
                                    <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                        {costalerosInTrabajadera.length} {costalerosInTrabajadera.length === 1 ? 'Hermano' : 'Hermanos'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {costalerosInTrabajadera.map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => setSelectedCostalero(c.id)}
                                        className="bg-white p-5 rounded-[24px] flex items-center justify-between group cursor-pointer border border-black/5 shadow-sm hover:border-primary/20 transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-xl italic border border-primary/10">
                                                {c.trabajadera}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-extrabold text-neutral-900 text-lg tracking-tight italic">{c.nombre} {c.apellidos}</p>
                                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">{c.puesto || 'Costalero'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-neutral-200 group-hover:text-primary transition-colors" size={24} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-12 space-y-4">
                        <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                            <Users size={40} />
                        </div>
                        <p className="text-neutral-400 font-medium italic">No se encontraron costaleros</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!selectedCostalero}
                onClose={() => setSelectedCostalero(null)}
                title="Acciones de Costalero"
            >
                <div className="space-y-3 p-2">
                    <button
                        onClick={() => router.push(`/cuadrilla/${selectedCostalero}`)}
                        className="w-full h-14 rounded-2xl bg-neutral-50 text-neutral-700 font-bold flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all border border-black/5 shadow-sm"
                    >
                        Ver Ficha Detallada
                    </button>
                    <button
                        onClick={() => router.push(`/cuadrilla/${selectedCostalero}/editar`)}
                        className="w-full h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all"
                    >
                        Editar Información
                    </button>
                </div>
            </Modal>
        </div>
    );
}
