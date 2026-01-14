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
import { useUserRole } from "@/hooks/useUserRole";
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
    const { isCostalero } = useUserRole();
    const [userName, setUserName] = useState("Usuario");
    const [stats, setStats] = useState<Stats>({
        totalCostaleros: 0,
        eventosPendientes: 0,
        asistencias: { total: 0, presentes: 0, porcentaje: 0 }
    });
    const [proximoEvento, setProximoEvento] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario");
            }

            // 1. Obtener cuadrilla
            const { count: total } = await supabase.from("costaleros").select("*", { count: 'exact', head: true });

            // 2. Obtener próximo evento
            const now = new Date().toISOString();
            const [eventosRes, proximosRes] = await Promise.all([
                supabase.from("eventos").select("*").neq("estado", "finalizado"),
                supabase.from("eventos")
                    .select("*")
                    .gte("fecha_inicio", now)
                    .order("fecha_inicio", { ascending: true })
                    .limit(1)
                    .single()
            ]);

            const pendientesCount = eventosRes.data?.length || 0;
            const proximo = proximosRes.data;

            // 3. Estadísticas de asistencia (Último evento finalizado)
            const { data: ultimoEvento } = await supabase
                .from("eventos")
                .select("*")
                .eq("estado", "finalizado")
                .order("fecha_inicio", { ascending: false })
                .limit(1)
                .single();

            let asistenciaStats = { total: total || 35, presentes: 0, porcentaje: 0 };

            if (ultimoEvento) {
                const eventDate = new Date(ultimoEvento.fecha_inicio).toISOString().split('T')[0];
                const { data: asistencias } = await supabase
                    .from("asistencias")
                    .select("estado")
                    .eq("fecha", eventDate);

                const presentes = asistencias?.filter(a => a.estado === 'presente').length || 0;
                const totalAsistencias = asistencias?.length || total || 1;
                asistenciaStats = {
                    total: total || 35,
                    presentes,
                    porcentaje: Math.round((presentes / totalAsistencias) * 100)
                };
            }

            setStats({
                totalCostaleros: total || 0,
                eventosPendientes: pendientesCount,
                asistencias: asistenciaStats
            });
            setProximoEvento(proximo);
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
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                {isCostalero ? "COSTALERO" : "SUPERADMIN"}
                            </span>
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

                {proximoEvento ? (
                    <div className="bg-orange-50/50 border border-orange-100 p-8 rounded-[40px] shadow-sm flex flex-col space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight leading-none">{proximoEvento.titulo}</h3>
                                <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest">{proximoEvento.tipo}</p>
                            </div>
                            <div className="p-3 bg-white/80 rounded-2xl text-orange-600 shadow-sm border border-orange-100">
                                <Clock size={24} />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-500 font-bold text-xs">
                                    {new Date(proximoEvento.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            </div>
                            <div className="h-4 w-[1px] bg-neutral-200" />
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-900 font-black text-sm">
                                    {new Date(proximoEvento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                    {proximoEvento.fecha_fin && ` - ${new Date(proximoEvento.fecha_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[140px]">
                        <div className="h-12 w-12 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300">
                            <Calendar size={24} />
                        </div>
                        <p className="text-neutral-400 font-bold italic text-sm">No hay eventos próximos programados</p>
                    </div>
                )}
            </div>

            {/* Avisos Recientes */}
            <div className="space-y-4">
                <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Avisos Recientes</h2>
                <div className="bg-white/50 p-8 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/5 text-primary/20">
                        <Bell size={32} />
                    </div>
                    <p className="text-neutral-400 font-bold text-xs italic uppercase tracking-wider">Tablón de anuncios vacío</p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="space-y-4">
                <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Estadísticas</h2>
                <div className="grid grid-cols-2 gap-4">
                    {/* Eventos Card */}
                    <div className="bg-amber-50/50 p-7 rounded-[40px] border border-amber-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-3 rounded-2xl bg-white shadow-sm text-amber-600">
                            <Calendar size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-neutral-900">{stats.eventosPendientes}</p>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Eventos</p>
                            <p className="text-[9px] text-amber-700 font-black uppercase tracking-tighter">Pendientes</p>
                        </div>
                    </div>

                    {/* Asistido Card */}
                    <div className="bg-emerald-50/50 p-7 rounded-[40px] border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-3 rounded-2xl bg-white shadow-sm text-emerald-600">
                            <CheckCircle2 size={28} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline justify-center gap-1">
                                <p className="text-4xl font-black text-neutral-900">{stats.asistencias.presentes}</p>
                                <p className="text-xl font-bold text-neutral-400">/{stats.asistencias.total}</p>
                            </div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Asistencia</p>
                            <p className="text-[10px] text-emerald-700 font-black">{stats.asistencias.porcentaje}% Media</p>
                        </div>
                    </div>

                    {/* Cuadrilla Card */}
                    <div className="col-span-2 bg-blue-50/50 p-7 rounded-[40px] border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-3 rounded-2xl bg-white shadow-sm text-primary">
                            <Users size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-neutral-900">{stats.totalCostaleros}</p>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Miembros en Cuadrilla</p>
                            <p className="text-[9px] text-primary font-black uppercase tracking-widest">Gestión Activa</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
