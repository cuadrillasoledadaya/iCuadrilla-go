"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    Pencil,
    Trash2,
    QrCode,
    LayoutGrid,
    Share2,
    Repeat,
    Ruler,
    Users,
    Hourglass,
    ChevronRight,
    Activity,
    CheckCircle2,
    Timer,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface Evento {
    id: string;
    titulo: string;
    fecha_inicio: string;
    estado: string;
}

export default function DetalleEvento() {
    const params = useParams();
    const router = useRouter();
    const { isCostalero } = useUserRole();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [stats, setStats] = useState({ presentes: 0, justificados: 0, ausentes: 0, pendientes: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    const handleDelete = async () => {
        if (!evento) return;

        const confirmDelete = window.confirm(
            `¿Estás seguro de que deseas eliminar el evento "${evento.titulo}"? \n\nESTA ACCIÓN ELIMINARÁ TAMBIÉN TODAS LAS ASISTENCIAS registradas para este día (${new Date(evento.fecha_inicio).toLocaleDateString()}) y no se puede deshacer.`
        );

        if (!confirmDelete) return;

        setLoading(true);
        try {
            // 1. Obtener la fecha exacta del evento para limpiar asistencias
            const dateObj = new Date(evento.fecha_inicio);
            const eventDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

            // 2. Borrar asistencias asociadas (Limpieza de residuos)
            const { error: assistError } = await supabase
                .from("asistencias")
                .delete()
                .eq("fecha", eventDate);

            if (assistError) {
                console.error("Error al borrar asistencias:", assistError);
                // No detenemos el borrado del evento, pero avisamos
            }

            // 3. Borrar el evento
            const { error: eventError } = await supabase
                .from("eventos")
                .delete()
                .eq("id", evento.id);

            if (eventError) {
                alert("Error al borrar el evento: " + eventError.message);
                setLoading(false);
                return;
            }

            router.push("/eventos");
        } catch (err) {
            console.error("Error inesperado al borrar:", err);
            alert("Error inesperado al borrar el evento.");
            setLoading(false);
        }
    };

    // Calcular estado dinámico
    const calculateStatus = (inicio: string, fin: string | null): 'pendiente' | 'en-curso' | 'finalizado' => {
        const now = new Date();
        const start = new Date(inicio);
        const end = fin ? new Date(fin) : new Date(start.getTime() + 3 * 60 * 60 * 1000);

        if (now < start) return 'pendiente';
        if (now >= start && now <= end) return 'en-curso';
        return 'finalizado';
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data: eventData } = await supabase
                .from("eventos")
                .select("*")
                .eq("id", params.id)
                .single();

            if (eventData) {
                // Sincronizar estado si es necesario
                const realStatus = calculateStatus(eventData.fecha_inicio, eventData.fecha_fin);
                if (realStatus !== eventData.estado) {
                    await supabase.from("eventos").update({ estado: realStatus }).eq("id", params.id);
                    eventData.estado = realStatus;
                }

                setEvento(eventData);

                // Hacer consultas en paralelo para velocidad
                const [costalerosRes, asistenciasRes] = await Promise.all([
                    supabase.from("costaleros").select("id", { count: "exact", head: true }),
                    supabase.from("asistencias").select("estado").eq("evento_id", params.id)
                ]);

                const totalCostaleros = costalerosRes.count || 0;
                const asistencias = asistenciasRes.data || [];

                const presentes = asistencias.filter(a => a.estado === 'presente').length;
                const justificados = asistencias.filter(a => a.estado === 'justificado' || a.estado === 'justificada').length;
                const ausentes = asistencias.filter(a => a.estado === 'ausente').length;

                // Pendientes reales = Total - (Todos los que tienen registro)
                const procesados = asistencias.length;
                const pendientes = totalCostaleros - procesados;

                setStats({
                    presentes,
                    justificados,
                    ausentes,
                    pendientes,
                    total: totalCostaleros
                });
            }
            setLoading(false);
        };
        fetchData();
    }, [params.id]);

    const actionButtons = [
        // Ocultar acciones de gestión para costaleros
        ...(!isCostalero ? [
            { label: "ESCANEAR NUEVOS", icon: QrCode, color: "bg-blue-600 shadow-blue-200", href: `/asistencia/scanner?evento=${params.id}` }
        ] : []),
        { label: "VER POR TRABAJADERAS", icon: LayoutGrid, color: "bg-emerald-600 shadow-emerald-200", href: `/eventos/${params.id}/trabajaderas` },
        { label: "WHATSAPP", icon: Share2, color: "bg-green-500 shadow-green-200", href: `https://wa.me/?text=Asistencia` },
        // Ocultar acciones de gestión para costaleros
        ...(!isCostalero ? [
            { label: "GESTIONAR RELEVOS", icon: Repeat, color: "bg-amber-600 shadow-amber-200", href: `/eventos/${params.id}/relevos` },
            { label: "MEDICIONES", icon: Ruler, color: "bg-indigo-600 shadow-indigo-200", href: `/eventos/${params.id}/mediciones` }
        ] : []),
    ];

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (!evento) return (
        <div className="p-6 text-center space-y-4 bg-[#FAFAFA] min-h-screen">
            <p className="text-neutral-500">Evento no encontrado.</p>
            <Button onClick={() => router.back()}>Volver</Button>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors z-10"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 text-center px-12">
                    {evento.titulo}
                </h1>
                {!isCostalero && (
                    <div className="absolute right-0 flex gap-2">
                        <button
                            onClick={() => router.push(`/eventos/${params.id}/editar`)}
                            className="p-3 bg-white border border-black/5 rounded-xl text-neutral-400 hover:text-indigo-600 shadow-sm transition-colors"
                        >
                            <Pencil size={20} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-3 bg-white border border-black/5 rounded-xl text-neutral-400 hover:text-red-600 shadow-sm transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </header>

            {/* Info Central */}
            <div className={cn(
                "text-center space-y-3 py-10 rounded-[48px] border shadow-md transition-all duration-500",
                evento.estado === 'en-curso' ? "bg-emerald-100/60 border-emerald-200" :
                    evento.estado === 'finalizado' ? "bg-red-100/60 border-red-200" :
                        "bg-orange-100/60 border-orange-200"
            )}>
                <div className={cn(
                    "inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-2 shadow-sm",
                    evento.estado === 'en-curso' ? "bg-emerald-200/80 border-emerald-300 text-emerald-900" :
                        evento.estado === 'finalizado' ? "bg-red-200/80 border-red-300 text-red-900" :
                            "bg-orange-200/80 border-orange-300 text-orange-900"
                )}>
                    {evento.estado === 'en-curso' ? <Activity size={14} className="animate-pulse" /> :
                        evento.estado === 'finalizado' ? <CheckCircle2 size={14} /> : <Timer size={14} />}
                    {evento.estado.replace('-', ' ')}
                </div>
                <h2 className="text-4xl font-black text-neutral-900 uppercase tracking-tighter px-6">{evento.titulo}</h2>
                <p className="text-neutral-600 font-bold capitalize text-sm">
                    {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}, {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-3xl font-black text-emerald-600">{stats.presentes}</span>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Presentes</span>
                </div>
                <div className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-3xl font-black text-amber-500">{stats.justificados}</span>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Justif.</span>
                </div>
                <div className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-3xl font-black text-red-500">{stats.ausentes}</span>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Ausentes</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
                {actionButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={() => router.push(btn.href)}
                        className={cn(
                            "w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all",
                            btn.color
                        )}
                    >
                        <btn.icon size={20} />
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Listas Section */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Listas de Asistencia</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push(`/eventos/${params.id}/asistentes`)}
                        className="w-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                <Users size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-extrabold text-neutral-900 text-sm italic">Ver Asistentes</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{stats.presentes + stats.justificados} registrados</p>
                            </div>
                        </div>
                        <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
                    </button>

                    <button
                        onClick={() => router.push(`/eventos/${params.id}/pendientes`)}
                        className="w-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                                <Hourglass size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-extrabold text-neutral-900 text-sm italic">Ver Pendientes</p>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{stats.total - (stats.presentes + stats.justificados + stats.ausentes)} sin registrar</p>
                            </div>
                        </div>
                        <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
