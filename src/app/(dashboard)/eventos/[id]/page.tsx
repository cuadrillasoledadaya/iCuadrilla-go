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
    Trophy,
    TrendingUp
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

interface TrabajaderaStat {
    id: number;
    total: number;
    presentes: number;
    justificados: number;
    ausentes: number;
    pendientes: number;
}

export default function DetalleEvento() {
    const params = useParams();
    const router = useRouter();
    const { isCostalero, userId, canManageEvents, rol } = useUserRole();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [stats, setStats] = useState({ presentes: 0, justificados: 0, ausentes: 0, pendientes: 0, total: 0 });
    const [trabajaderaStats, setTrabajaderaStats] = useState<TrabajaderaStat[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAbsenceModal, setShowAbsenceModal] = useState(false);
    const [absenceReason, setAbsenceReason] = useState("");
    const [costaleroId, setCostaleroId] = useState<string | null>(null);
    const [alreadyNotified, setAlreadyNotified] = useState(false);

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
                const { data: costaleroData } = await supabase.from("costaleros").select("id").eq("user_id", userId).single();
                if (costaleroData) {
                    setCostaleroId(costaleroData.id);
                    const { data: asistenciaData } = await supabase.from("asistencias").select("estado").eq("evento_id", evento.id).eq("costalero_id", costaleroData.id).single();
                    if (asistenciaData) setAlreadyNotified(true);
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
                titulo: `Ausencia: ${evento.titulo}`,
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
        ...(canManageEvents ? [{ label: "ESCANEAR NUEVOS", icon: QrCode, color: "bg-blue-600 shadow-blue-200", href: `/asistencia/scanner?evento=${params.id}` }] : []),
        { label: "VER POR TRABAJADERAS", icon: LayoutGrid, color: "bg-emerald-600 shadow-emerald-200", href: `/eventos/${params.id}/trabajaderas` },
        { label: "WHATSAPP", icon: Share2, color: "bg-green-500 shadow-green-200", href: `https://wa.me/?text=Asistencia` },
        ...(canManageEvents ? [
            { label: "GESTIONAR RELEVOS", icon: Repeat, color: "bg-amber-600 shadow-amber-200", href: `/eventos/${params.id}/relevos` },
            { label: "MEDICIONES", icon: Ruler, color: "bg-indigo-600 shadow-indigo-200", href: `/eventos/${params.id}/mediciones` }
        ] : []),
        ...(rol === 'costalero' && !alreadyNotified && evento?.estado === 'pendiente' ? [{ label: "NOTIFICAR AUSENCIA", icon: AlertCircle, color: "bg-red-500 shadow-red-200", action: () => setShowAbsenceModal(true) }] : [])
    ];

    if (loading && !evento) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (!evento) return <div className="p-6 text-center bg-background min-h-screen"><Button onClick={() => router.back()}>Volver</Button></div>;

    const progress = stats.total > 0 ? Math.round(((stats.presentes + stats.justificados) / stats.total) * 100) : 0;

    // Predictive messages
    const getPredictiveMessage = () => {
        if (progress === 100) return "¡Cuadrilla completa! Todo listo.";
        if (progress > 90) return `Casi listo. Faltan ${stats.pendientes} hermanos por llegar.`;
        if (progress > 70) return `¡Buen ritmo! Faltan ${stats.pendientes} costaleros.`;
        if (stats.pendientes > 0) return `Todavía faltan ${stats.pendientes} costaleros por llegar.`;
        return "Iniciando control de asistencia...";
    };

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen relative">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button onClick={() => router.back()} className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 group/back z-10">
                    <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
                </button>
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 text-center px-12 line-clamp-1">{evento.titulo}</h1>
                {canManageEvents && (
                    <div className="flex gap-2">
                        <button onClick={() => router.push(`/eventos/${params.id}/editar`)} className="p-3 bg-white border border-black/5 rounded-2xl text-neutral-400 hover:text-primary transition-colors"><Pencil size={20} /></button>
                        <button onClick={handleDelete} className="p-3 bg-white border border-black/5 rounded-2xl text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                    </div>
                )}
            </header>

            {/* Info Central Premium */}
            <div className={cn(
                "p-8 rounded-[48px] border shadow-xl transition-all duration-500 space-y-6 relative overflow-hidden",
                evento.estado === 'en-curso' ? "bg-emerald-50 border-emerald-100" :
                    evento.estado === 'finalizado' ? "bg-red-50 border-red-100" : "bg-white border-neutral-100"
            )}>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    {evento.estado === 'en-curso' ? <Activity size={120} /> : <Timer size={120} />}
                </div>

                <div className="space-y-2 relative z-10 text-center">
                    <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm mb-4",
                        evento.estado === 'en-curso' ? "bg-emerald-500 text-white border-emerald-400" :
                            evento.estado === 'finalizado' ? "bg-neutral-600 text-white border-neutral-500" : "bg-amber-500 text-white border-amber-400"
                    )}>
                        {evento.estado === 'en-curso' ? <Activity size={12} className="animate-pulse" /> :
                            evento.estado === 'finalizado' ? <CheckCircle2 size={12} /> : <Timer size={12} />}
                        {evento.estado.replace('-', ' ')}
                    </div>
                    <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter leading-none italic">{evento.titulo}</h2>
                    <p className="text-neutral-500 font-bold capitalize text-xs">
                        {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} • {new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Progress Wheel/Bar */}
                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Progreso Total</span>
                        <span className="text-2xl font-black text-neutral-900 italic">{progress}%</span>
                    </div>
                    <div className="h-4 bg-neutral-100 rounded-full overflow-hidden p-1 border shadow-inner">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out",
                                progress > 80 ? "bg-emerald-500" : progress > 40 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[11px] font-bold text-neutral-600 text-center animate-pulse pt-2 italic">
                        {getPredictiveMessage()}
                    </p>
                </div>
            </div>

            {/* Dashboard Visual de Trabajaderas (Admin/Capataz only) */}
            {canManageEvents && (
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] pl-2 flex items-center gap-2">
                        <LayoutGrid size={14} className="text-primary" /> Visual por Trabajaderas
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {trabajaderaStats.map((t) => (
                            <div key={t.id} className="bg-white p-4 rounded-[32px] border border-black/5 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-md italic shadow-inner border",
                                    t.pendientes === 0 ? "bg-emerald-500 text-white border-emerald-400" :
                                        t.presentes > 0 ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-neutral-50 text-neutral-300 border-neutral-100"
                                )}>
                                    {t.id}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                        <span className="text-neutral-900">Trabajadera {t.id}</span>
                                        <span className="text-neutral-400">{t.presentes + t.justificados} / {t.total}</span>
                                    </div>
                                    <div className="flex gap-1 h-3">
                                        {/* Presentes */}
                                        {Array.from({ length: t.presentes }).map((_, i) => (
                                            <div key={`p-${i}`} className="flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-in zoom-in" />
                                        ))}
                                        {/* Justificados */}
                                        {Array.from({ length: t.justificados }).map((_, i) => (
                                            <div key={`j-${i}`} className="flex-1 bg-amber-400 rounded-full animate-in zoom-in" />
                                        ))}
                                        {/* Ausentes */}
                                        {Array.from({ length: t.ausentes }).map((_, i) => (
                                            <div key={`a-${i}`} className="flex-1 bg-red-400 rounded-full animate-in zoom-in" />
                                        ))}
                                        {/* Pendientes */}
                                        {Array.from({ length: t.pendientes }).map((_, i) => (
                                            <div key={`n-${i}`} className="flex-1 bg-neutral-100 border border-neutral-200/50 rounded-full" />
                                        ))}
                                    </div>
                                </div>
                                {t.pendientes === 0 && <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />}
                                {t.ausentes > 0 && <AlertCircle className="text-red-500 shrink-0 animate-pulse" size={18} />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid Refined */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { val: stats.presentes, label: "PRES.", color: "text-emerald-500" },
                    { val: stats.justificados, label: "JUST.", color: "text-amber-500" },
                    { val: stats.ausentes, label: "AUS.", color: "text-red-500" },
                    { val: stats.pendientes, label: "PEND.", color: "text-neutral-400" }
                ].map((s, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-[24px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center">
                        <span className={cn("text-xl font-black italic", s.color)}>{s.val}</span>
                        <span className="text-[8px] font-black text-neutral-300 tracking-widest">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                {actionButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={'action' in btn ? btn.action : () => router.push(btn.href!)}
                        className={cn(
                            "h-20 rounded-3xl flex flex-col items-center justify-center gap-2 text-white font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all border-b-4",
                            btn.color,
                            "border-black/10"
                        )}
                    >
                        <btn.icon size={24} />
                        {btn.label.split(' ')[0]}
                    </button>
                ))}
            </div>

            {/* Listas Section (Only if not costalero) */}
            {!isCostalero && (
                <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-black text-neutral-400 uppercase tracking-[0.2em] pl-2">Listas Detalladas</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => router.push(`/eventos/${params.id}/asistentes`)} className="w-full bg-white p-5 rounded-[32px] border border-black/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                                    <Users size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-extrabold text-neutral-900 text-sm italic">Ver Listado Real</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{stats.presentes + stats.justificados} presentes registrados</p>
                                </div>
                            </div>
                            <ChevronRight className="text-neutral-300 group-hover:text-primary transition-colors" size={20} />
                        </button>

                        <button onClick={() => router.push(`/eventos/${params.id}/pendientes`)} className="w-full bg-white p-5 rounded-[32px] border border-black/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
                                    <Hourglass size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-extrabold text-neutral-900 text-sm italic">Pendientes por Llegar</p>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{stats.pendientes} hermanos sin registrar</p>
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
                    <div className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 border-t-4 border-primary">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-extrabold uppercase text-neutral-900 italic">Notificar Ausencia</h3>
                            <button onClick={() => setShowAbsenceModal(false)} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200"><X size={20} className="text-neutral-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-neutral-500 font-medium">Esta ausencia se registrará automáticamente en la base de datos.</p>
                            <textarea value={absenceReason} onChange={(e) => setAbsenceReason(e.target.value)} placeholder="Motivo de la ausencia..." className="w-full h-32 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium text-sm focus:ring-2 focus:ring-primary/50 resize-none outline-none transition-all" />
                        </div>
                        <Button onClick={handleConfirmAbsence} disabled={!absenceReason.trim() || loading} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg">{loading ? "Enviando..." : <><Send size={18} className="mr-2" /> Enviar Motivo</>}</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
