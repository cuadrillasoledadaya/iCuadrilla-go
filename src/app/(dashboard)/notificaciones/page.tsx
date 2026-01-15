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
    Check,
    Trophy
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
    destinatario?: string; // Added this to handle dual roles
}

export default function NotificacionesPage() {
    const router = useRouter();
    const { isCostalero, isAdmin, loading: roleLoading, costaleroId } = useUserRole();
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotificaciones = async () => {
        const queries = [];

        if (isAdmin) {
            queries.push(
                supabase.from("notificaciones")
                    .select("*")
                    .eq("destinatario", "admin")
            );
        }

        if (isCostalero && costaleroId) {
            queries.push(
                supabase.from("notificaciones")
                    .select("*")
                    .eq("destinatario", "costalero")
                    .eq("costalero_id", costaleroId)
            );
        }

        const results = await Promise.all(queries);
        const allNotifs = results.flatMap(r => r.data || []);

        // Sort by date manually since we fetched from two sources
        allNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setNotificaciones(allNotifs);
        setLoading(false);
    };

    useEffect(() => {
        if (!roleLoading) {
            fetchNotificaciones();
        }
    }, [roleLoading, isCostalero, costaleroId, isAdmin]); // Added isAdmin to dependencies

    const deleteAll = async () => {
        if (!confirm("¿Estás seguro de que quieres eliminar todas las notificaciones?")) return;

        setNotificaciones([]);

        const deletePromises = [];
        if (isAdmin) {
            deletePromises.push(
                supabase.from("notificaciones")
                    .delete()
                    .eq("destinatario", "admin")
            );
        }
        if (isCostalero && costaleroId) {
            deletePromises.push(
                supabase.from("notificaciones")
                    .delete()
                    .eq("destinatario", "costalero")
                    .eq("costalero_id", costaleroId)
            );
        }

        await Promise.all(deletePromises);
        router.refresh();
    };

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

        const updatePromises = [];
        if (isAdmin) {
            updatePromises.push(
                supabase.from("notificaciones")
                    .update({ leido: true })
                    .eq("leido", false)
                    .eq("destinatario", "admin")
            );
        }
        if (isCostalero && costaleroId) {
            updatePromises.push(
                supabase.from("notificaciones")
                    .update({ leido: true })
                    .eq("leido", false)
                    .eq("destinatario", "costalero")
                    .eq("costalero_id", costaleroId)
            );
        }

        await Promise.all(updatePromises);
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
        router.refresh();
    };

    if (roleLoading || loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

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
                                                notif.leido ? "bg-neutral-100 text-neutral-400" : (notif.tipo === 'aniversario' ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary")
                                            )}>
                                                {notif.tipo === 'aniversario' ? <Trophy size={18} /> : <Bell size={18} />}
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className={cn(
                                                    "text-xs font-bold uppercase tracking-widest",
                                                    notif.leido ? "text-neutral-400" : (notif.tipo === 'aniversario' ? "text-amber-600" : "text-primary")
                                                )}>
                                                    {notif.tipo === 'aniversario' ? 'Aniversario' : 'Ausencia'}
                                                </p>
                                                <p className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className={cn("font-bold text-sm", !notif.leido ? "text-neutral-900" : "text-neutral-500")}>
                                                {notif.titulo}
                                            </h3>
                                            {isAdmin && isCostalero && (
                                                <span className={cn(
                                                    "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                                                    notif.destinatario === 'admin' ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-600"
                                                )}>
                                                    {notif.destinatario === 'admin' ? "Admin" : "Costalero"}
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn("text-xs leading-relaxed", !notif.leido ? "text-neutral-600" : "text-neutral-400")}>
                                            {notif.mensaje}
                                        </p>
                                    </div>

                                    {/* Actions (Only for Admins/Capataces and Absence type) */}
                                    {isAdmin && notif.tipo === 'ausencia' && (
                                        <div className="flex flex-col gap-2 pt-2 border-t border-black/5 mt-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleJustify(notif.id, notif.evento_id!, notif.costalero_id!);
                                                    }}
                                                    className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                                                >
                                                    Justificar
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConfirmAbsence(notif.id, notif.evento_id!, notif.costalero_id!);
                                                    }}
                                                    className="flex-1 py-2.5 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                                                >
                                                    Marcar Ausente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Action Footer */}
                                    <div className="flex flex-wrap items-center justify-between pt-3 border-t border-dashed border-neutral-100 pl-12 mt-2">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notif.id);
                                                }}
                                                disabled={notif.leido}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors",
                                                    notif.leido ? "bg-neutral-50 text-neutral-300 cursor-not-allowed" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-200"
                                                )}
                                            >
                                                {notif.leido ? <Check size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                {notif.leido ? "Leída" : "Marcar leída"}
                                            </button>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm("¿Seguro que quieres eliminar esta notificación?")) {
                                                    deleteNotification(notif.id);
                                                }
                                            }}
                                            className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                                        >
                                            <Trash2 size={14} />
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
