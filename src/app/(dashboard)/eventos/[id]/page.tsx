"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft,
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
    AlertCircle,
    X,
    Send,
    BarChart3
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
    const { isCostalero, userId, canManageEvents, rol } = useUserRole();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [stats, setStats] = useState({ presentes: 0, justificados: 0, ausentes: 0, pendientes: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    const [showAbsenceModal, setShowAbsenceModal] = useState(false);
    const [absenceReason, setAbsenceReason] = useState("");
    const [costaleroId, setCostaleroId] = useState<string | null>(null);
    const [costaleroNombre, setCostaleroNombre] = useState("");
    const [alreadyNotified, setAlreadyNotified] = useState(false);
    const [isNotificationRead, setIsNotificationRead] = useState(false);

    const fetchData = async () => {
        const { data: eventData } = await supabase
            .from("eventos")
            .select("*")
            .eq("id", params.id)
            .single();

        if (eventData) {
            const realStatus = calculateStatus(eventData.fecha_inicio, eventData.fecha_fin);
            if (realStatus !== eventData.estado) {
                await supabase.from("eventos").update({ estado: realStatus }).eq("id", params.id);
                eventData.estado = realStatus;
            }
            setEvento(eventData);

            const [costalerosRes, asistenciasRes] = await Promise.all([
                supabase.from("costaleros").select("id", { count: "exact", head: true }).eq("rol", "costalero"),
                supabase.from("asistencias").select("estado, costalero_id").eq("evento_id", params.id)
            ]);

            const totalCostaleros = costalerosRes.count || 0;
            const asistencias = asistenciasRes.data || [];

            const presentes = asistencias.filter(a => a.estado === 'presente').length;
            const justificados = asistencias.filter(a => a.estado === 'justificado' || a.estado === 'justificada').length;
            const ausentes = asistencias.filter(a => a.estado === 'ausente').length;
            const pendientes = totalCostaleros - (presentes + justificados + ausentes);

            setStats({ presentes, justificados, ausentes, pendientes, total: totalCostaleros });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const calculateStatus = (inicio: string, fin: string | null): 'pendiente' | 'en-curso' | 'finalizado' => {
        const now = new Date();
        const start = new Date(inicio);
        const end = fin ? new Date(fin) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
        if (now < start) return 'pendiente';
        if (now >= start && now <= end) return 'en-curso';
        return 'finalizado';
    };

    useEffect(() => {
        const fetchCostaleroInfo = async () => {
            if (isCostalero && userId && evento) {
                const { data: costaleroData } = await supabase.from("costaleros").select("id, nombre, apellidos").eq("user_id", userId).single();
                if (costaleroData) {
                    setCostaleroId(costaleroData.id);
                    setCostaleroNombre(`${costaleroData.nombre} ${costaleroData.apellidos}`);
                    const { data: asistenciaData } = await supabase.from("asistencias").select("estado").eq("evento_id", evento.id).eq("costalero_id", costaleroData.id).single();
                    if (asistenciaData) {
                        setAlreadyNotified(true);
                        // Verificar si la notificación ha sido leída
                        const { data: notifData } = await supabase
                            .from("notificaciones")
                            .select("leido")
                            .eq("evento_id", evento.id)
                            .eq("costalero_id", costaleroData.id)
                            .eq("tipo", "ausencia")
                            .maybeSingle();

                        if (notifData) {
                            setIsNotificationRead(notifData.leido);
                        }
                    }
                }
            }
        };
        fetchCostaleroInfo();
    }, [isCostalero, userId, evento]);

    const handleConfirmAbsence = async () => {
        if (!costaleroId || !evento || !absenceReason.trim()) return;
        setLoading(true);
        try {
            const dateObj = new Date(evento.fecha_inicio);
            const eventDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            await supabase.from("asistencias").upsert({
                evento_id: evento.id,
                costalero_id: costaleroId,
                fecha: eventDate,
                estado: 'ausente',
                motivo_ausencia: absenceReason,
                validada_por_capataz: false
            });
            await supabase.from("notificaciones").insert({
                titulo: `Ausencia: ${costaleroNombre} - ${evento.titulo}`,
                mensaje: `Motivo: ${absenceReason}`,
                tipo: 'ausencia',
                evento_id: evento.id,
                costalero_id: costaleroId,
                leido: false,
                destinatario: 'admin'
            });
            alert("Ausencia notificada.");
            setAlreadyNotified(true);
            setShowAbsenceModal(false);
            fetchData();
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!evento) return;
        if (!window.confirm(`¿Borrar "${evento.titulo}"?`)) return;
        setLoading(true);
        await supabase.from("asistencias").delete().eq("evento_id", evento.id);
        const { error } = await supabase.from("eventos").delete().eq("id", evento.id);
        if (error) alert(error.message);
        else router.push("/eventos");
        setLoading(false);
    };

    const actionButtons = [
        ...(canManageEvents ? [
            { label: "ESTADÍSTICAS DETALLADAS", icon: BarChart3, color: "bg-neutral-900 shadow-neutral-200", href: `/eventos/${params.id}/estadisticas` },
            { label: "ESCANEAR NUEVOS", icon: QrCode, color: "bg-blue-600 shadow-blue-200", href: `/asistencia/scanner?evento=${params.id}` }
        ] : []),
        { label: "VER POR TRABAJADERAS", icon: LayoutGrid, color: "bg-emerald-600 shadow-emerald-200", href: `/eventos/${params.id}/trabajaderas` },
        ...(canManageEvents ? [
            { label: "GESTIONAR RELEVOS", icon: Repeat, color: "bg-amber-600 shadow-amber-200", href: `/eventos/${params.id}/relevos` },
            { label: "MEDICIONES", icon: Ruler, color: "bg-indigo-600 shadow-indigo-200", href: `/eventos/${params.id}/mediciones` },
            { label: "COMPARTIR WHATSAPP", icon: Share2, color: "bg-green-500 shadow-green-200", href: `https://wa.me/?text=Asistencia` }
        ] : []),
        ...(rol === 'costalero' && !alreadyNotified && evento?.estado === 'pendiente' ? [
            { label: "NOTIFICAR AUSENCIA", icon: AlertCircle, color: "bg-red-500 shadow-red-200", action: () => setShowAbsenceModal(true) }
        ] : [])
    ];

    if (loading && !evento) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (!evento) return <div className="p-6 text-center bg-background min-h-screen"><Button onClick={() => router.back()}>Volver</Button></div>;

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen relative">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button onClick={() => router.back()} className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 group/back z-10">
                    <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 text-center px-12 line-clamp-1">{evento.titulo}</h1>
                {canManageEvents && (
                    <div className="flex gap-2">
                        <button onClick={() => router.push(`/eventos/${params.id}/editar`)} className="p-3 bg-white border border-black/5 rounded-2xl text-neutral-400 hover:text-primary transition-colors hover:border-primary/20"><Pencil size={20} /></button>
                        <button onClick={handleDelete} className="p-3 bg-white border border-black/5 rounded-2xl text-neutral-400 hover:text-red-500 transition-colors hover:border-red-100"><Trash2 size={20} /></button>
                    </div>
                )}
            </header>

            {/* Info Central Reverted to clean style */}
            <div className={cn(
                "text-center space-y-3 py-10 rounded-[48px] border shadow-md transition-all duration-500",
                evento.estado === 'en-curso' ? "bg-emerald-100/60 border-emerald-200" :
                    evento.estado === 'finalizado' ? "bg-red-100/60 border-red-200" : "bg-orange-100/60 border-orange-200"
            )}>
                <div className={cn(
                    "inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border mb-2 shadow-sm",
                    evento.estado === 'en-curso' ? "bg-emerald-200/80 border-emerald-300 text-emerald-900" :
                        evento.estado === 'finalizado' ? "bg-red-200/80 border-red-300 text-red-900" : "bg-orange-200/80 border-orange-300 text-orange-900"
                )}>
                    {evento.estado === 'en-curso' ? <Activity size={14} className="animate-pulse" /> :
                        evento.estado === 'finalizado' ? <CheckCircle2 size={14} /> : <Timer size={14} />}
                    {evento.estado.replace('-', ' ')}
                </div>
                <h2 className="text-4xl font-black text-neutral-900 uppercase tracking-tighter px-6">{evento.titulo}</h2>
                <p className="text-neutral-600 font-bold capitalize text-sm">
                    {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}, {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {isCostalero && alreadyNotified && (
                    <div className={cn(
                        "mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-all duration-500",
                        isNotificationRead ? "bg-emerald-600 text-white" : "bg-neutral-900 text-white"
                    )}>
                        <CheckCircle2 size={14} className={cn("transition-colors", isNotificationRead ? "text-white" : "text-emerald-400")} />
                        <span>{isNotificationRead ? "Respuesta Leída" : "Respuesta Enviada"}</span>
                    </div>
                )}
            </div>

            {/* Simple Stats Grid */}
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

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
                {actionButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={'action' in btn ? btn.action : () => router.push(btn.href!)}
                        className={cn(
                            "h-16 rounded-2xl flex flex-col items-center justify-center gap-2 text-white font-black text-[9px] uppercase tracking-widest shadow-md active:scale-[0.98] transition-all",
                            btn.color
                        )}
                    >
                        <btn.icon size={20} />
                        {btn.label.split(' ').slice(0, 2).join(' ')}
                    </button>
                ))}
            </div>

            {/* Lists Section */}
            {!isCostalero && (
                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">Listas de Asistencia</h3>
                    <div className="space-y-3">
                        <button onClick={() => router.push(`/eventos/${params.id}/asistentes`)} className="w-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-inner"><Users size={24} /></div>
                                <div className="text-left">
                                    <p className="font-extrabold text-neutral-900 text-sm italic">Ver Asistentes</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{stats.presentes + stats.justificados} registrados</p>
                                </div>
                            </div>
                            <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
                        </button>
                        <button onClick={() => router.push(`/eventos/${params.id}/pendientes`)} className="w-full bg-white p-5 rounded-[24px] border border-black/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-inner"><Hourglass size={24} /></div>
                                <div className="text-left">
                                    <p className="font-extrabold text-neutral-900 text-sm italic">Ver Pendientes</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{stats.pendientes} sin registrar</p>
                                </div>
                            </div>
                            <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Absence Modal */}
            {showAbsenceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-[32px] p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center text-neutral-900">
                            <h3 className="text-lg font-black uppercase italic">Motivo de Ausencia</h3>
                            <button onClick={() => setShowAbsenceModal(false)} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200"><X size={20} className="text-neutral-500" /></button>
                        </div>
                        <textarea value={absenceReason} onChange={(e) => setAbsenceReason(e.target.value)} placeholder="Escribe tu motivo aquí..." className="w-full h-32 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none" />
                        <Button onClick={handleConfirmAbsence} disabled={!absenceReason.trim() || loading} className="w-full h-14 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">{loading ? "Enviando..." : <><Send size={18} /> Enviar Notificación</>}</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
