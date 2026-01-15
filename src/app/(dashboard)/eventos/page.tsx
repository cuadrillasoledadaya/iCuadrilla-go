"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    Search,
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    Plus,
    Activity,
    CheckCircle2,
    Timer
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface Evento {
    id: string;
    titulo: string;
    tipo: string;
    fecha_inicio: string;
    fecha_fin: string;
    ubicacion: string;
    estado: 'pendiente' | 'en-curso' | 'finalizado';
}

export default function AgendaEventos() {
    const router = useRouter();
    const { isCostalero, canManageEvents } = useUserRole();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventos = async () => {
            const { data } = await supabase
                .from("eventos")
                .select("*")
                .order("fecha_inicio", { ascending: false });

            if (data) setEventos(data as Evento[]);
            setLoading(false);
        };
        fetchEventos();
    }, []);

    const filtered = eventos.filter(e =>
        e.titulo.toLowerCase().includes(search.toLowerCase()) ||
        e.ubicacion.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusStyle = (estado: string) => {
        switch (estado) {
            case 'en-curso': return 'bg-emerald-200/80 border-emerald-300 text-emerald-900';
            case 'finalizado': return 'bg-red-200/80 border-red-300 text-red-900';
            default: return 'bg-orange-200/80 border-orange-300 text-orange-900';
        }
    };

    const getCardStyle = (estado: string) => {
        switch (estado) {
            case 'en-curso': return 'bg-emerald-100/60 border-emerald-200 shadow-emerald-100/20';
            case 'finalizado': return 'bg-red-100/60 border-red-200 shadow-red-100/20';
            default: return 'bg-orange-100/60 border-orange-200 shadow-orange-100/20';
        }
    };

    const getStatusIcon = (estado: string) => {
        switch (estado) {
            case 'en-curso': return <Activity size={10} className="animate-pulse" />;
            case 'finalizado': return <CheckCircle2 size={10} />;
            default: return <Timer size={10} />;
        }
    };

    const getStatusLabel = (estado: string) => {
        switch (estado) {
            case 'en-curso': return 'EN CURSO';
            case 'finalizado': return 'FINALIZADO';
            default: return 'PENDIENTE';
        }
    };

    // Calcular estado dinámico
    const calculateStatus = (inicio: string, fin: string | null): 'pendiente' | 'en-curso' | 'finalizado' => {
        const now = new Date();
        const start = new Date(inicio);
        const end = fin ? new Date(fin) : new Date(start.getTime() + 3 * 60 * 60 * 1000); // Default 3h if no end time

        if (now < start) return 'pendiente';
        if (now >= start && now <= end) return 'en-curso';
        return 'finalizado';
    };

    // Sincronizar estados con DB periódicamente
    useEffect(() => {
        if (eventos.length === 0) return;

        const syncStatuses = async () => {
            const updates = eventos.map(async (e) => {
                const realStatus = calculateStatus(e.fecha_inicio, e.fecha_fin);
                if (realStatus !== e.estado) {
                    await supabase.from("eventos").update({ estado: realStatus }).eq("id", e.id);
                    return { ...e, estado: realStatus };
                }
                return e;
            });

            const updatedEventos = await Promise.all(updates);
            // Solo actualizamos el estado local si algo cambió para evitar loops
            if (JSON.stringify(updatedEventos) !== JSON.stringify(eventos)) {
                setEventos(updatedEventos);
            }
        };

        syncStatuses();
        const interval = setInterval(syncStatuses, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [eventos.length]); // Depend on length to trigger after initial fetch

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tight uppercase text-neutral-900">Agenda de Eventos</h1>
                    <p className="text-neutral-500 font-bold italic text-[10px] tracking-widest uppercase">Temporada 2025</p>
                </div>
            </header>

            {/* Búsqueda */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <Input
                    placeholder="Buscar evento o lugar..."
                    className="bg-white pl-12 h-14 border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400 focus:ring-primary/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Listado de Tarjetas */}
            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-black/5 shadow-sm">
                        <Calendar className="mx-auto text-neutral-200 mb-4" size={48} />
                        <p className="text-neutral-400 font-bold">No hay eventos programados</p>
                    </div>
                ) : (
                    filtered.map((e) => (
                        <div
                            key={e.id}
                            onClick={() => router.push(`/eventos/${e.id}`)}
                            className={cn(
                                "p-6 rounded-[32px] flex flex-col space-y-4 group cursor-pointer active:scale-[0.98] transition-all border shadow-sm",
                                getCardStyle(e.estado)
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-black text-neutral-900 group-hover:text-primary transition-colors uppercase tracking-tight">
                                    {e.titulo}
                                </h3>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                                    getStatusStyle(e.estado)
                                )}>
                                    {getStatusIcon(e.estado)}
                                    {getStatusLabel(e.estado)}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-neutral-600 font-bold">
                                    <div className="p-1.5 rounded-lg bg-white/50 text-neutral-700">
                                        <Calendar size={14} />
                                    </div>
                                    <span className="text-xs">
                                        {new Date(e.fecha_inicio).toLocaleDateString('es-ES')}
                                    </span>
                                    <span className="text-neutral-300 mx-1">•</span>
                                    <div className="p-1.5 rounded-lg bg-white/50 text-neutral-700">
                                        <Clock size={14} />
                                    </div>
                                    <span className="text-xs">
                                        {new Date(e.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        {e.fecha_fin && ` - ${new Date(e.fecha_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-neutral-500 font-medium italic">
                                    <div className="p-1.5 rounded-lg bg-white/50 text-neutral-400">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="text-xs truncate">{e.ubicacion}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-black/5">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mr-auto italic group-hover:text-primary transition-colors">Ver Detalles</span>
                                <ChevronRight className="text-neutral-400 group-hover:text-primary transition-colors" size={20} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            {canManageEvents && (
                <button
                    onClick={() => router.push('/eventos/nuevo')}
                    className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-40"
                >
                    <Plus size={32} strokeWidth={3} />
                </button>
            )}
        </div>
    );
}
