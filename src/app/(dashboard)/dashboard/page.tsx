"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Menu,
    Bell,
    Calendar,
    Users,
    CheckCircle2,
    Clock,
    ChevronRight,
} from "lucide-react";
import { useLayout } from "@/components/layout-context";
import { cn } from "@/lib/utils";

interface Stats {
    totalCostaleros: number;
    eventosPendientes: number;
    asistencias: {
        total: number;
        presentes: number;
        porcentaje: number;
    };
}

export default function DashboardPage() {
    const { setSidebarOpen } = useLayout();
    const [userName, setUserName] = useState("Usuario");
    const [stats, setStats] = useState<Stats>({
        totalCostaleros: 35,
        eventosPendientes: 0,
        asistencias: { total: 0, presentes: 0, porcentaje: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario");
            }

            const { count: total } = await supabase.from("costaleros").select("*", { count: 'exact', head: true });

            setStats({
                totalCostaleros: total || 35,
                eventosPendientes: 0,
                asistencias: { total: 35, presentes: 0, porcentaje: 0 }
            });

            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA]">
            {/* Header */}
            <header className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Hola {userName}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">SUPERADMIN</span>
                            <span className="text-neutral-300">•</span>
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Temporada 2025</span>
                        </div>
                    </div>
                </div>
                <button className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-colors relative">
                    <Bell size={24} />
                    <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                </button>
            </header>

            {/* Próximo Evento */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-neutral-400" />
                    <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">PRÓXIMO EVENTO</h2>
                </div>
                <div className="bg-white p-10 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[140px]">
                    <div className="h-12 w-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300">
                        <Calendar size={24} />
                    </div>
                    <p className="text-neutral-400 font-bold italic text-sm">No hay eventos próximos programados</p>
                </div>
            </div>

            {/* Avisos Recientes */}
            <div className="space-y-4">
                <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Avisos Recientes</h2>
                <div className="bg-white p-10 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-5 rounded-full bg-primary/5 text-primary/30">
                        <Bell size={48} />
                    </div>
                    <p className="text-neutral-500 font-bold text-sm">No hay avisos nuevos en el tablón</p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="space-y-4">
                <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Estadísticas</h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Eventos Card */}
                    <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4 border-l-4 border-l-amber-500">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                            <Calendar size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-neutral-900">{stats.eventosPendientes}</p>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Eventos</p>
                            <p className="text-[9px] text-neutral-500 font-bold">Pendientes</p>
                        </div>
                    </div>

                    {/* Asistido Card */}
                    <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4 border-l-4 border-l-emerald-500">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={28} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline justify-center gap-1">
                                <p className="text-4xl font-black text-neutral-900">{stats.asistencias.presentes}</p>
                                <p className="text-xl font-bold text-neutral-400">/{stats.asistencias.total}</p>
                            </div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Asistencia</p>
                            <p className="text-[10px] text-emerald-600 font-black">{stats.asistencias.porcentaje}%</p>
                        </div>
                    </div>

                    {/* Cuadrilla Card */}
                    <div className="col-span-2 bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4 border-l-4 border-l-primary">
                        <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                            <Users size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-neutral-900">{stats.totalCostaleros}</p>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Cuadrilla</p>
                            <p className="text-[9px] text-primary font-black uppercase">Hermandad</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
