"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    LayoutGrid,
    Activity,
    Timer,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    BarChart3
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface TrabajaderaStat {
    id: number;
    total: number;
    presentes: number;
    justificados: number;
    ausentes: number;
    pendientes: number;
}

function EstadisticasContent() {
    const params = useParams();
    const router = useRouter();
    const { canManageEvents } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [evento, setEvento] = useState<any>(null);
    const [stats, setStats] = useState({ presentes: 0, justificados: 0, ausentes: 0, pendientes: 0, total: 0 });
    const [trabajaderaStats, setTrabajaderaStats] = useState<TrabajaderaStat[]>([]);

    const fetchData = async () => {
        const { data: eventData } = await supabase
            .from("eventos")
            .select("*")
            .eq("id", params.id)
            .single();

        if (eventData) {
            setEvento(eventData);

            const [costalerosRes, asistenciasRes] = await Promise.all([
                supabase.from("costaleros").select("id, trabajadera").eq("rol", "costalero"),
                supabase.from("asistencias").select("estado, costalero_id").eq("evento_id", params.id)
            ]);

            const costaleros = costalerosRes.data || [];
            const asistencias = asistenciasRes.data || [];

            // Stats globales
            const presentes = asistencias.filter(a => a.estado === 'presente').length;
            const justificados = asistencias.filter(a => a.estado === 'justificado' || a.estado === 'justificada').length;
            const ausentes = asistencias.filter(a => a.estado === 'ausente').length;
            const total = costaleros.length;
            const pendientes = total - (presentes + justificados + ausentes);

            setStats({ presentes, justificados, ausentes, pendientes, total });

            // Stats por trabajadera (1-7)
            const tStats: TrabajaderaStat[] = Array.from({ length: 7 }, (_, i) => ({
                id: i + 1,
                total: 0,
                presentes: 0,
                justificados: 0,
                ausentes: 0,
                pendientes: 0
            }));

            costaleros.forEach(c => {
                const t = c.trabajadera;
                if (t >= 1 && t <= 7) {
                    const idx = t - 1;
                    tStats[idx].total++;
                    const asis = asistencias.find(a => a.costalero_id === c.id);
                    if (asis?.estado === 'presente') tStats[idx].presentes++;
                    else if (asis?.estado === 'justificado' || asis?.estado === 'justificada') tStats[idx].justificados++;
                    else if (asis?.estado === 'ausente') tStats[idx].ausentes++;
                    else tStats[idx].pendientes++;
                }
            });

            setTrabajaderaStats(tStats);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    const progress = stats.total > 0 ? Math.round(((stats.presentes + stats.justificados) / stats.total) * 100) : 0;

    const getPredictiveMessage = () => {
        if (progress === 100) return "¡Cuadrilla completa! Todo listo.";
        if (progress > 90) return `Casi listo. Faltan ${stats.pendientes} hermanos por llegar.`;
        if (progress > 70) return `¡Buen ritmo! Faltan ${stats.pendientes} costaleros.`;
        if (stats.pendientes > 0) return `Todavía faltan ${stats.pendientes} costaleros por llegar.`;
        return "Iniciando control de asistencia...";
    };

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 z-10"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900 text-center px-12">Estadísticas Detalladas</h1>
            </header>

            {/* Global Summary Card */}
            <div className="p-8 rounded-[40px] bg-white border border-black/5 shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5 text-primary">
                    <TrendingUp size={200} />
                </div>

                <div className="text-center space-y-1 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Progreso de la Asistencia</p>
                    <h2 className="text-5xl font-black text-neutral-900 italic">{progress}%</h2>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="h-4 bg-neutral-100 rounded-full overflow-hidden p-1 border shadow-inner">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.3)]",
                                progress > 80 ? "bg-emerald-500" : progress > 40 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[11px] font-extrabold text-neutral-600 text-center animate-pulse italic">
                        {getPredictiveMessage()}
                    </p>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 relative z-10">
                    {[
                        { val: stats.presentes, label: "PRES", color: "text-emerald-500" },
                        { val: stats.justificados, label: "JUST", color: "text-amber-500" },
                        { val: stats.ausentes, label: "AUS", color: "text-red-500" },
                        { val: stats.pendientes, label: "PEND", color: "text-neutral-400" }
                    ].map((s, idx) => (
                        <div key={idx} className="bg-neutral-50 p-3 rounded-2xl border border-black/5 text-center">
                            <span className={cn("text-lg font-black italic block", s.color)}>{s.val}</span>
                            <span className="text-[7px] font-black text-neutral-400 tracking-widest">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trabajadera Map */}
            <div className="space-y-6">
                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                    <LayoutGrid size={16} className="text-primary" /> Mapa por Trabajaderas
                </h3>

                <div className="grid grid-cols-1 gap-3">
                    {trabajaderaStats.map((t) => (
                        <div key={t.id} className="bg-white p-5 rounded-[32px] border border-black/5 shadow-md flex items-center gap-5 group transition-all">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg italic shadow-inner border transition-colors",
                                t.pendientes === 0 ? "bg-emerald-500 text-white border-emerald-400" :
                                    t.presentes > 0 ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-neutral-50 text-neutral-300 border-neutral-100"
                            )}>
                                {t.id}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                    <span className="text-neutral-900 italic">Trabajadera {t.id}</span>
                                    <span className="text-neutral-400">{t.presentes + t.justificados} de {t.total}</span>
                                </div>
                                <div className="flex gap-1.5 h-3.5">
                                    {Array.from({ length: t.presentes }).map((_, i) => (
                                        <div key={`p-${i}`} className="flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                    ))}
                                    {Array.from({ length: t.justificados }).map((_, i) => (
                                        <div key={`j-${i}`} className="flex-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.2)]" />
                                    ))}
                                    {Array.from({ length: t.ausentes }).map((_, i) => (
                                        <div key={`a-${i}`} className="flex-1 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.2)]" />
                                    ))}
                                    {Array.from({ length: t.pendientes }).map((_, i) => (
                                        <div key={`n-${i}`} className="flex-1 bg-neutral-100 border border-neutral-200/50 rounded-full" />
                                    ))}
                                </div>
                            </div>
                            {t.pendientes === 0 && <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />}
                            {t.ausentes > 0 && <AlertCircle className="text-red-500 shrink-0 animate-pulse" size={20} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="bg-neutral-900 rounded-[24px] p-4 flex justify-around items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Presente</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Justifica</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Ausente</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-700" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Pendiente</span>
                </div>
            </div>
        </div>
    );
}

export default function EstadisticasEvento() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        }>
            <EstadisticasContent />
        </Suspense>
    );
}
