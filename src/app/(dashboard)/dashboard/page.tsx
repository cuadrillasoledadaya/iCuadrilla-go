"use client";

import { useEffect, useState, useRef } from "react";
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
import { useRouter } from "next/navigation";
import { saveToCache, getFromCache } from "@/lib/offline-utils";

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
    const router = useRouter();
    const { setSidebarOpen } = useLayout();
    const { isCostalero, isAdmin, isMaster, rol, loading: roleLoading, userId, costaleroId } = useUserRole();
    const [userName, setUserName] = useState("Usuario");
    const [stats, setStats] = useState<Stats>({
        totalCostaleros: 0,
        eventosPendientes: 0,
        asistencias: { total: 0, presentes: 0, porcentaje: 0 }
    });
    const [proximosEventos, setProximosEventos] = useState<any[]>([]);
    const [avisos, setAvisos] = useState<any[]>([]); // New State
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeSeasonName, setActiveSeasonName] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeAvisoIndex, setActiveAvisoIndex] = useState(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const avisosCarouselRef = useRef<HTMLDivElement>(null);

    const handleCarouselScroll = (container: HTMLDivElement | null, setIndex: (i: number) => void) => {
        if (!container) return;

        const containerCenter = container.scrollLeft + container.clientWidth / 2;
        let closestIndex = 0;
        let minDiff = Infinity;

        Array.from(container.children).forEach((child, index) => {
            const childEl = child as HTMLElement;
            const childCenter = childEl.offsetLeft + childEl.offsetWidth / 2;
            const diff = Math.abs(childCenter - containerCenter);

            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });

        setIndex(closestIndex);
    };

    useEffect(() => {
        if (roleLoading) return;

        const fetchDashboardData = async () => {
            // Cargar de caché primero
            const cachedStats = getFromCache<Stats>("dashboard_stats");
            const cachedProximos = getFromCache<any[]>("dashboard_eventos");
            const cachedAvisos = getFromCache<any[]>("dashboard_avisos");
            const cachedSeason = getFromCache<string>("active_season");
            const cachedUser = getFromCache<string>("user_name");

            if (cachedStats) setStats(cachedStats);
            if (cachedProximos) setProximosEventos(cachedProximos);
            if (cachedAvisos) setAvisos(cachedAvisos);
            if (cachedSeason) setActiveSeasonName(cachedSeason);
            if (cachedUser) setUserName(cachedUser);

            // Si hay algo en caché, quitamos el loading inicial (aunque se actualizará en background)
            if (cachedStats || cachedProximos) setLoading(false);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario";
                setUserName(name);
                saveToCache("user_name", name);
            }

            // 0. Obtener temporada activa
            const { data: activeSeason } = await supabase
                .from("temporadas")
                .select("nombre")
                .eq("activa", true)
                .single();
            if (activeSeason) {
                setActiveSeasonName(activeSeason.nombre);
                saveToCache("active_season", activeSeason.nombre);
            }

            // 1. Obtener cuadrilla (Solo costaleros activos, excluyendo staff)
            const { count: total } = await supabase.from("costaleros")
                .select("*", { count: 'exact', head: true })
                .eq("rol", "costalero");

            // 2. Check for 25-year anniversary costaleros
            await checkAnniversaryNotifications();

            // 3. Obtener próximo evento y anuncios (Parallel Fetch)
            const now = new Date().toISOString();

            const notifPromises = [];
            if (isAdmin) {
                notifPromises.push(
                    supabase.from("notificaciones")
                        .select("id", { count: "exact" })
                        .eq("leido", false)
                        .eq("destinatario", "admin")
                );
            }
            if (isCostalero && costaleroId) {
                notifPromises.push(
                    supabase.from("notificaciones")
                        .select("id", { count: "exact" })
                        .eq("leido", false)
                        .eq("destinatario", "costalero")
                        .eq("costalero_id", costaleroId)
                );
            }

            const [eventosRes, proximosRes, anunciosRes, ...notifResults] = await Promise.all([
                supabase.from("eventos").select("*").neq("estado", "finalizado"),
                supabase.from("eventos")
                    .select("*")
                    .gte("fecha_inicio", now)
                    .order("fecha_inicio", { ascending: true })
                    .limit(5),
                supabase.from("anuncios")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(5),
                ...notifPromises
            ]);

            const pendientesCount = eventosRes.data?.length || 0;
            const eventosProximos = proximosRes.data || [];
            const avisosData = anunciosRes.data || [];
            const resolvedNotifCount = notifResults.reduce((acc, res) => acc + (res.count || 0), 0);
            setUnreadCount(resolvedNotifCount);

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

            const newStats = {
                totalCostaleros: total || 0,
                eventosPendientes: pendientesCount,
                asistencias: asistenciaStats
            };

            setStats(newStats);
            setProximosEventos(eventosProximos);
            setAvisos(avisosData);

            // Guardar en caché
            saveToCache("dashboard_stats", newStats);
            saveToCache("dashboard_eventos", eventosProximos);
            saveToCache("dashboard_avisos", avisosData);

            setLoading(false);
        };

        const checkAnniversaryNotifications = async () => {
            const now = new Date();
            const currentMonth = now.getMonth(); // Jan is 0
            const currentDay = now.getDate();

            // Only notify between Jan 2nd (0/2) and May 1st (4/1)
            const isWithinRange =
                (currentMonth === 0 && currentDay >= 2) || // Jan 2+
                (currentMonth > 0 && currentMonth < 4) ||  // Feb, Mar, Apr
                (currentMonth === 4 && currentDay === 1);   // May 1

            if (!isWithinRange) return;

            const currentYear = now.getFullYear();

            // Define anniversaries to check: { years: 25, offset: 24 }, { years: 50, offset: 49 }
            const anniversaries = [
                { years: 25, offset: 24 },
                { years: 50, offset: 49 }
            ];

            for (const ann of anniversaries) {
                // Formula: ano_ingreso + offset = currentYear
                const targetYear = currentYear - ann.offset;

                // Find costaleros celebrating this anniversary
                const { data: jubilaryCostaleros } = await supabase
                    .from("costaleros")
                    .select("id, nombre, apellidos, ano_ingreso")
                    .eq("ano_ingreso", targetYear);

                if (!jubilaryCostaleros || jubilaryCostaleros.length === 0) continue;

                // For each costalero, check/create notification
                for (const costalero of jubilaryCostaleros) {
                    const notificationTitle = `🎉 ${ann.years} Años de Costalero: ${costalero.nombre} ${costalero.apellidos}`;

                    if (isAdmin) {
                        const { data: adminNotif } = await supabase
                            .from("notificaciones")
                            .select("id")
                            .eq("titulo", notificationTitle)
                            .eq("destinatario", "admin")
                            .eq("costalero_id", costalero.id)
                            .limit(1);

                        if (!adminNotif || adminNotif.length === 0) {
                            await supabase
                                .from("notificaciones")
                                .insert({
                                    titulo: notificationTitle,
                                    mensaje: `${costalero.nombre} ${costalero.apellidos} cumple ${ann.years} años como costalero este año ${currentYear}. ¡Enhorabuena!`,
                                    tipo: 'aniversario',
                                    leido: false,
                                    costalero_id: costalero.id,
                                    destinatario: 'admin'
                                });
                        }
                    }

                    // 2. Create/Check COSTALERO Notification
                    if (isCostalero && costaleroId === costalero.id) {
                        const { data: costNotif } = await supabase
                            .from("notificaciones")
                            .select("id")
                            .eq("titulo", notificationTitle)
                            .eq("destinatario", "costalero")
                            .eq("costalero_id", costalero.id)
                            .limit(1);

                        if (!costNotif || costNotif.length === 0) {
                            await supabase
                                .from("notificaciones")
                                .insert({
                                    titulo: notificationTitle,
                                    mensaje: `¡Enhorabuena! Este año ${currentYear} cumples ${ann.years} años en la cuadrilla. Gracias por una vida de entrega y devoción.`,
                                    tipo: 'aniversario',
                                    leido: false,
                                    costalero_id: costalero.id,
                                    destinatario: 'costalero'
                                });
                        }
                    }
                }
            }
        };

        fetchDashboardData();
    }, [roleLoading, isAdmin, isCostalero, costaleroId]);

    // ... (rest of render logic remains until "Avisos Recientes" section)

    {/* Avisos Recientes */ }
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Avisos Recientes</h2>
            {avisos.length > 0 && (
                <a href="/anuncios" className="text-[10px] font-bold text-primary hover:underline">VER TODO</a>
            )}
        </div>

        {avisos.length > 0 ? (
            <div className="space-y-3">
                {avisos.map((aviso) => (
                    <div key={aviso.id} className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 rounded-full text-neutral-500">
                                <Bell size={16} />
                            </div>
                            <h3 className="font-bold text-neutral-900 text-sm">{aviso.titulo}</h3>
                        </div>
                        <p className="text-xs text-neutral-500 line-clamp-2 pl-11">{aviso.contenido}</p>
                        <p className="text-[9px] text-neutral-400 pl-11 font-bold uppercase tracking-wider">
                            {new Date(aviso.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-white/50 p-8 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/5 text-primary/20">
                    <Bell size={32} />
                </div>
                <p className="text-neutral-400 font-bold text-xs italic uppercase tracking-wider">Tablón de anuncios vacío</p>
            </div>
        )}
    </div>

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background">
            {/* Header */}
            {/* Header */}
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Hola {userName}</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                            {isMaster ? "SUPERADMIN" :
                                rol === 'capataz' ? "CAPATAZ" :
                                    rol === 'auxiliar' ? "AUXILIAR" :
                                        (isAdmin && isCostalero ? "ADMIN + COSTALERO" : isAdmin ? "ADMIN" : "COSTALERO")}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Temporada {activeSeasonName || "..."}</span>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/notificaciones')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Próximos Eventos (Carrusel) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-neutral-400" />
                    <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">PRÓXIMOS EVENTOS</h2>
                </div>

                {proximosEventos.length > 0 ? (
                    <div className="space-y-4">
                        {/* Carousel Container */}
                        <div
                            ref={carouselRef}
                            onScroll={() => handleCarouselScroll(carouselRef.current, setActiveIndex)}
                            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar"
                        >
                            {proximosEventos.map((evento: any) => (
                                <div
                                    key={evento.id}
                                    className="snap-center shrink-0 w-[85%] bg-orange-50/50 border border-orange-100 p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[160px]"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1 flex-1">
                                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight leading-none line-clamp-2">{evento.titulo}</h3>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <div className="p-2 bg-white/80 rounded-xl text-orange-600 shadow-sm border border-orange-100">
                                                <Clock size={20} />
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-orange-700 bg-white/50 px-2 py-0.5 rounded-lg border border-orange-100/50">
                                                {evento.estado || 'PENDIENTE'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-orange-200/50 mt-4">
                                        <span className="text-neutral-600 font-bold text-xs">
                                            {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <div className="h-3 w-[1px] bg-neutral-300" />
                                        <span className="text-neutral-900 font-black text-sm flex items-center">
                                            {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                            {evento.fecha_fin && (
                                                <>
                                                    <span className="text-neutral-300 mx-1">-</span>
                                                    {new Date(evento.fecha_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Dots Indicator */}
                        <div className="flex justify-center gap-1.5">
                            {proximosEventos.map((_: any, idx: number) => (
                                <div key={idx} className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", idx === activeIndex ? "bg-primary w-4" : "bg-neutral-200")} />
                            ))}
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
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Avisos Recientes</h2>
                    {avisos.length > 0 && (
                        <a href="/anuncios" className="text-[10px] font-bold text-primary hover:underline">VER TODO</a>
                    )}
                </div>

                {avisos.length > 0 ? (
                    <div className="space-y-4">
                        {/* Carousel Container */}
                        <div
                            ref={avisosCarouselRef}
                            onScroll={() => handleCarouselScroll(avisosCarouselRef.current, setActiveAvisoIndex)}
                            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 no-scrollbar"
                        >
                            {avisos.map((aviso: any) => (
                                <div
                                    key={aviso.id}
                                    className="snap-center shrink-0 w-[85%] bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-3 flex flex-col min-h-[140px]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-neutral-100 rounded-full text-neutral-500 shrink-0">
                                            <Bell size={16} />
                                        </div>
                                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-1">{aviso.titulo}</h3>
                                    </div>
                                    <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed">{aviso.contenido}</p>
                                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider pt-2 border-t border-neutral-100">
                                        {new Date(aviso.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Dots Indicator */}
                        <div className="flex justify-center gap-1.5">
                            {avisos.map((_: any, idx: number) => (
                                <div key={idx} className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", idx === activeAvisoIndex ? "bg-primary w-4" : "bg-neutral-200")} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/50 p-8 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-primary/5 text-primary/20">
                            <Bell size={32} />
                        </div>
                        <p className="text-neutral-400 font-bold text-xs italic uppercase tracking-wider">Tablón de anuncios vacío</p>
                    </div>
                )}
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
                    <div className="col-span-2 bg-primary/5 p-7 rounded-[40px] border border-primary/10 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
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
