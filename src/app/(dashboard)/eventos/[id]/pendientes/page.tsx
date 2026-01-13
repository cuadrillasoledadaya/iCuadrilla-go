"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    FileText,
    MoreVertical,
    Clock
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
    estado?: string | null;
}

export default function PendientesPage() {
    const params = useParams();
    const router = useRouter();
    const [evento, setEvento] = useState<any>(null);
    const [pendientes, setPendientes] = useState<Costalero[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCostalero, setSelectedCostalero] = useState<Costalero | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // 1. Fetch Evento
            const { data: eventData } = await supabase.from("eventos").select("*").eq("id", params.id).single();
            if (!eventData) return;
            setEvento(eventData);

            const eventDate = new Date(eventData.fecha_inicio).toISOString().split('T')[0];

            // 2. Fetch Costaleros & Asistencias
            const [costalerosRes, asistenciasRes] = await Promise.all([
                supabase.from("costaleros").select("*").order("apellidos"),
                supabase.from("asistencias").select("*").eq("fecha", eventDate)
            ]);

            const allCostaleros = costalerosRes.data || [];
            const allAsistencias = asistenciasRes.data || [];

            // 3. Filter Pendientes (NO tiene registro en asistencias)
            const filtered = allCostaleros.filter(c => {
                const asistencia = allAsistencias.find((a: any) => a.costalero_id === c.id);
                return !asistencia; // Si NO tiene asistencia, es pendiente.
            });

            setPendientes(filtered);
            setLoading(false);
        };

        fetchData();

        // Re-fetch when window regains focus (e.g., navigating back from Asistentes)
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [params.id]);

    const updateStatus = async (newStatus: 'presente' | 'justificado' | 'ausente') => {
        if (!selectedCostalero || !evento) return;
        // setLoading(true); // Removed to rely on optimistic UI and prevent hanging

        const eventDate = new Date(evento.fecha_inicio).toISOString().split('T')[0];

        if (newStatus === 'presente' || newStatus === 'justificado' || newStatus === 'ausente') {
            // Optimistic Update: Remove from list immediately
            setPendientes(prev => prev.filter(p => p.id !== selectedCostalero.id));
            setSelectedCostalero(null);

            // 1. Check if exists
            const { data: existing } = await supabase.from("asistencias")
                .select("id")
                .eq("costalero_id", selectedCostalero.id)
                .eq("fecha", eventDate)
                .single();

            const dbStatus = newStatus === 'justificado' ? 'justificada' : newStatus;

            let error;
            if (existing) {
                const res = await supabase.from("asistencias").update({ estado: dbStatus }).eq("id", existing.id);
                error = res.error;
            } else {
                const res = await supabase.from("asistencias").insert({
                    costalero_id: selectedCostalero.id,
                    fecha: eventDate,
                    estado: dbStatus
                });
                error = res.error;
            }

            if (error) {
                console.error("Error updating:", error);
                alert("Error: " + error.message);
                window.location.reload();
            }
        }
    };

    if (loading && !pendientes.length) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900">Pendientes</h1>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{pendientes.length} POR LLEGAR</p>
                </div>
            </header>

            <div className="space-y-3">
                {pendientes.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="font-bold text-emerald-500">¡Todos han fichado! 🎉</p>
                    </div>
                ) : pendientes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedCostalero(m)}
                        className="w-full bg-white p-4 rounded-[20px] flex justify-between items-center transition-all border border-black/5 shadow-sm active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-500 font-bold">
                                <Clock size={16} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-neutral-900 text-sm">{m.nombre} {m.apellidos}</h3>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Sin registrar</p>
                            </div>
                        </div>
                        <MoreVertical size={20} className="text-neutral-300" />
                    </button>
                ))}
            </div>

            {/* Modal de Cambio de Estado */}
            {selectedCostalero && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedCostalero(null)}>
                    <div className="w-full max-w-md bg-white rounded-t-[32px] p-8 pb-32 space-y-6 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">{selectedCostalero.nombre} {selectedCostalero.apellidos}</h3>
                            <p className="text-sm font-medium text-neutral-400">¿Qué ha pasado con este costalero?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Button className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl" onClick={() => updateStatus('presente')}>
                                <CheckCircle2 className="mr-2" /> HA LLEGADO (PRESENTE)
                            </Button>
                            <Button className="h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-lg rounded-2xl" onClick={() => updateStatus('justificado')}>
                                <FileText className="mr-2" /> JUSTIFICAR FALTA
                            </Button>
                            <Button className="h-14 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-2xl" onClick={() => updateStatus('ausente')}>
                                <XCircle className="mr-2" /> MARCAR AUSENTE
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
