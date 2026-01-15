"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Bell,
    CheckCircle2,
    Clock,
    Trash2,
    Check
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface Notificacion {
    id: string;
    titulo: string;
    mensaje: string;
    created_at: string;
    leido: boolean;
    tipo: string;
    costalero_id?: string;
    evento_id?: string;
}

export default function NotificacionesPage() {
    const router = useRouter();
    const { isCostalero, loading: roleLoading } = useUserRole();
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roleLoading && isCostalero) {
            router.push("/dashboard"); // Redirect if not admin
        }
    }, [isCostalero, roleLoading, router]);

    const fetchNotificaciones = async () => {
        const { data } = await supabase
            .from("notificaciones")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) setNotificaciones(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotificaciones();
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));

        await supabase
            .from("notificaciones")
            .update({ leido: true })
            .eq("id", id);

        // Refresh to ensure sync (optional)
        router.refresh();
    };

    const markAllAsRead = async () => {
        setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));

        await supabase
            .from("notificaciones")
            .update({ leido: true })
            .eq("leido", false);

        router.refresh();
    };

    const handleJustify = async (notificationId: string, eventoId: string, costaleroId: string) => {
        // Confirmation dialog
        if (!window.confirm("¿Estás seguro de que deseas JUSTIFICAR esta ausencia?")) {
            return;
        }

        console.log("handleJustify called with:", { notificationId, eventoId, costaleroId });

        // 1. Update Asistencia to 'justificado'
        const { data, error: updateError } = await supabase
            .from("asistencias")
            .update({ estado: 'justificada' })
            .eq("evento_id", eventoId)
            .eq("costalero_id", costaleroId)
            .select();

        console.log("Update result:", { data, updateError });

        if (updateError) {
            console.error("Error updating asistencia:", updateError);
            alert("Error al justificar la asistencia: " + updateError.message);
            return;
        }

        if (!data || data.length === 0) {
            console.warn("No rows updated - check IDs");
            alert("No se encontró la asistencia para actualizar. Verifica los IDs.");
            return;
        }

        // 2. Mark notification as read
        await supabase
            .from("notificaciones")
            .update({ leido: true })
            .eq("id", notificationId);

        // Update UI
        setNotificaciones(prev => prev.map(n => n.id === notificationId ? { ...n, leido: true } : n));

        alert("✅ Ausencia JUSTIFICADA correctamente.");
        router.refresh();
    };

    const handleConfirmAbsence = async (notificationId: string, eventoId: string, costaleroId: string) => {
        // Confirmation dialog
        if (!window.confirm("¿Estás seguro de que deseas marcar como AUSENTE (no justificado)?")) {
            return;
        }

        console.log("handleConfirmAbsence called with:", { notificationId, eventoId, costaleroId });

        // 1. Update Asistencia to 'ausente'
        const { data, error: updateError } = await supabase
            .from("asistencias")
            .update({ estado: 'ausente' })
            .eq("evento_id", eventoId)
            .eq("costalero_id", costaleroId)
            .select();

        console.log("Update result:", { data, updateError });

        if (updateError) {
            console.error("Error updating asistencia:", updateError);
            alert("Error al marcar la ausencia: " + updateError.message);
            return;
        }

        // 2. Mark notification as read
        await supabase
            .from("notificaciones")
            .update({ leido: true })
            .eq("id", notificationId);

        // Update UI
        setNotificaciones(prev => prev.map(n => n.id === notificationId ? { ...n, leido: true } : n));

        alert("✅ Ausencia confirmada.");
        router.refresh();
    };

    const deleteNotification = async (id: string) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
        await supabase.from("notificaciones").delete().eq("id", id);
    };

    if (roleLoading || loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (isCostalero) return null; // Should redirect

    const unreadCount = notificaciones.filter(n => !n.leido).length;

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
                    Notificaciones
                </h1>
                <div className="absolute right-0">
                    <button
                        title="Marcar todas como leídas"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="p-3 bg-white border border-black/5 rounded-xl text-neutral-400 hover:text-primary shadow-sm transition-colors disabled:opacity-50"
                    >
                        <CheckCircle2 size={20} />
                    </button>
                </div>
            </header>

            {/* List */}
            <div className="space-y-4">
                {unreadCount > 0 && (
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{unreadCount} Sin leer</p>
                    </div>
                )}

                {notificaciones.length === 0 ? (
                    <div className="bg-white p-12 rounded-[32px] border border-black/5 shadow-sm flex flex-col items-center justify-center text-center space-y-4 pt-20">
                        <div className="p-4 rounded-full bg-neutral-50 text-neutral-300">
                            <Bell size={48} />
                        </div>
                        <p className="text-neutral-400 font-bold text-sm italic">No tienes notificaciones</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notificaciones.map((notif) => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "relative bg-white p-5 rounded-[24px] border shadow-sm transition-all duration-300 group",
                                    notif.leido ? "border-black/5 opacity-80" : "border-primary/20 shadow-primary/5 bg-primary/[0.02]"
                                )}
                            >
                                {!notif.leido && (
                                    <div className="absolute top-6 right-5 w-2 h-2 rounded-full bg-primary shadow-sm" />
                                )}

                                <div className="space-y-3 pr-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2.5 rounded-2xl",
                                                notif.leido ? "bg-neutral-100 text-neutral-400" : "bg-primary/10 text-primary"
                                            )}>
                                                <Bell size={18} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className={cn(
                                                    "text-xs font-bold uppercase tracking-widest",
                                                    notif.leido ? "text-neutral-400" : "text-primary"
                                                )}>
                                                    Ausencia
                                                </p>
                                                <p className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1 pl-12">
                                        <h3 className={cn("font-bold text-neutral-900 leading-tight", notif.leido && "font-medium text-neutral-600")}>
                                            {notif.titulo}
                                        </h3>
                                        <p className="text-sm text-neutral-500 leading-relaxed italic border-l-2 border-neutral-100 pl-3 py-1">
                                            "{notif.mensaje}"
                                        </p>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-dashed border-neutral-100 pl-12">
                                        {notif.tipo === 'ausencia' && notif.evento_id && notif.costalero_id && (
                                            <>
                                                <button
                                                    onClick={() => handleJustify(notif.id, notif.evento_id!, notif.costalero_id!)}
                                                    className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors border border-amber-200"
                                                >
                                                    <CheckCircle2 size={12} />
                                                    Justificar
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmAbsence(notif.id, notif.evento_id!, notif.costalero_id!)}
                                                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors border border-red-200"
                                                >
                                                    <Clock size={12} />
                                                    Marcar Ausente
                                                </button>
                                                <div className="h-4 w-[1px] bg-neutral-200 mx-1" />
                                            </>
                                        )}

                                        {!notif.leido && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Check size={12} />
                                                Marcar Leído
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif.id)}
                                            className="text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-red-500 flex items-center gap-1 transition-colors ml-auto"
                                        >
                                            <Trash2 size={12} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
