"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    FileText,
    MoreVertical,
    Trash2
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
    estado?: 'presente' | 'ausente' | 'justificado' | 'justificada' | null;
    asistencia_id?: string;
}

export default function AsistentesPage() {
    const params = useParams();
    const router = useRouter();
    const [evento, setEvento] = useState<any>(null);
    const [asistentes, setAsistentes] = useState<Costalero[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCostalero, setSelectedCostalero] = useState<Costalero | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // 1. Fetch Evento
            const { data: eventData } = await supabase.from("eventos").select("*").eq("id", params.id).single();
            if (!eventData) return;
            setEvento(eventData);

            // 2. Fetch Costaleros & Asistencias
            const [costalerosRes, asistenciasRes] = await Promise.all([
                supabase.from("costaleros").select("*").order("trabajadera", { ascending: true }).order("apellidos", { ascending: true }),
                supabase.from("asistencias").select("*").eq("evento_id", params.id)
            ]);

            const allCostaleros = costalerosRes.data || [];
            const allAsistencias = asistenciasRes.data || [];

            // 3. Filter Asistentes (Con estado presente, justificada o ausente)
            const filtered = allCostaleros.map(c => {
                const asistencia = allAsistencias.find((a: any) => a.costalero_id === c.id);
                return { ...c, estado: asistencia?.estado || null, asistencia_id: asistencia?.id || undefined };
            }).filter(c => c.estado && (c.estado === 'presente' || c.estado === 'justificada' || c.estado === 'ausente'));

            setAsistentes(filtered);
            setLoading(false);
        };

        fetchData();

        // Re-fetch when window regains focus
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [params.id]);

    const updateStatus = async (newStatus: 'presente' | 'justificado' | 'ausente' | 'delete') => {
        if (!selectedCostalero || !evento) return;
        // setLoading(true); // Removed to rely on optimistic UI and prevent hanging

        const dateObj = new Date(evento.fecha_inicio);
        const eventDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

        // Optimistic Update
        if (newStatus === 'delete') {
            // Remove from assistants list
            setAsistentes(prev => prev.filter(c => c.id !== selectedCostalero.id));
        } else {
            // Update status in list (including 'ausente')
            setAsistentes(prev => prev.map(c =>
                c.id === selectedCostalero.id ? { ...c, estado: newStatus === 'justificado' ? 'justificada' : newStatus } : c
            ));
        }
        setSelectedCostalero(null);

        if (newStatus === 'delete') {
            // Use record ID if we have it, fallback to costalero_id + fecha
            const query = supabase.from("asistencias").delete();
            if (selectedCostalero.asistencia_id) {
                const { error: deleteError } = await query.eq("id", selectedCostalero.asistencia_id);
                if (deleteError) {
                    console.error("Delete Error by ID:", deleteError);
                    alert("Error al limpiar: " + deleteError.message);
                }
            } else {
                const { error: deleteError } = await query.eq("costalero_id", selectedCostalero.id).eq("evento_id", params.id);
                if (deleteError) {
                    console.error("Delete Error by Filter:", deleteError);
                    alert("Error al limpiar: " + deleteError.message);
                }
            }
        } else {
            const dbStatus = newStatus === 'justificado' ? 'justificada' : newStatus;

            const { error } = await supabase
                .from("asistencias")
                .upsert({
                    costalero_id: selectedCostalero.id,
                    evento_id: params.id,
                    estado: dbStatus
                }, {
                    onConflict: 'costalero_id,evento_id'
                });

            if (error) {
                console.error(error);
                alert("Error: " + error.message);
            }
        }
    };

    if (loading && !asistentes.length) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors z-10"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black uppercase tracking-tighter text-neutral-900">Asistentes</h1>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">{asistentes.length} registrados</p>
                </div>
            </header>

            <div className="space-y-3">
                {asistentes.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <p className="font-bold text-neutral-400">Nadie ha llegado aún 🏜️</p>
                    </div>
                ) : asistentes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedCostalero(m)}
                        className={cn(
                            "w-full bg-white p-5 rounded-[24px] flex justify-between items-center transition-all border shadow-sm active:scale-[0.98]",
                            m.estado === 'presente' ? "border-emerald-500/20 shadow-emerald-500/5" : "border-amber-500/20"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold",
                                m.estado === 'presente' ? "bg-emerald-500" :
                                    (m.estado === 'justificada' || m.estado === 'justificado') ? "bg-amber-500" :
                                        "bg-red-500"
                            )}>
                                {m.nombre.charAt(0)}
                            </div>
                            <div className="text-left space-y-1">
                                <h3 className="font-extrabold text-neutral-900 text-sm tracking-tight italic">{m.nombre} {m.apellidos}</h3>
                                <div className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    m.estado === 'presente' ? "bg-emerald-50 text-emerald-600" :
                                        (m.estado === 'justificada' || m.estado === 'justificado') ? "bg-amber-50 text-amber-600" :
                                            "bg-red-50 text-red-600"
                                )}>
                                    {(m.estado === 'justificada' || m.estado === 'justificado') ? 'justificado' : m.estado}
                                </div>
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
                            <p className="text-sm font-medium text-neutral-400">Selecciona el nuevo estado</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Button className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl" onClick={() => updateStatus('presente')}>
                                <CheckCircle2 className="mr-2" /> PRESENTE
                            </Button>
                            <Button className="h-14 bg-amber-500 hover:bg-amber-600 text-white font-black text-lg rounded-2xl" onClick={() => updateStatus('justificado')}>
                                <FileText className="mr-2" /> JUSTIFICADO
                            </Button>
                            <Button className="h-14 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-2xl" onClick={() => updateStatus('ausente')}>
                                <XCircle className="mr-2" /> AUSENTE
                            </Button>
                            <div className="h-px bg-neutral-100 my-2" />
                            <Button variant="outline" className="h-14 border-red-100 text-red-500 hover:bg-red-50 font-black text-sm rounded-2xl" onClick={() => updateStatus('delete')}>
                                <Trash2 className="mr-2" size={16} /> LIMPIAR ASISTENCIA
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
