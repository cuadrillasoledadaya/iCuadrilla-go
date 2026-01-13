"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    FileText,
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
    estado?: 'presente' | 'ausente' | 'justificado';
    hora?: string;
}

export default function TrabajaderasAsistencia() {
    const params = useParams();
    const router = useRouter();
    const [eventoTitulo, setEventoTitulo] = useState("Evento");
    const [cuadrilla, setCuadrilla] = useState<Costalero[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCostalero, setSelectedCostalero] = useState<Costalero | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch Evento
            const { data: evento } = await supabase.from("eventos").select("*").eq("id", params.id).single();
            if (!evento) return;
            setEventoTitulo(evento.titulo);

            const eventDate = new Date(evento.fecha_inicio).toISOString().split('T')[0];

            // 2. Fetch Costaleros & Asistencias (Real Data)
            const [costalerosRes, asistenciasRes] = await Promise.all([
                supabase.from("costaleros").select("*").order("trabajadera").order("apellidos"),
                supabase.from("asistencias").select("*").eq("fecha", eventDate)
            ]);

            const allCostaleros = costalerosRes.data || [];
            const allAsistencias = asistenciasRes.data || [];

            setCuadrilla(allCostaleros.map((c) => {
                const asistencia = allAsistencias.find((a: any) => a.costalero_id === c.id);
                return {
                    ...c,
                    estado: asistencia ? asistencia.estado : null,
                    hora: asistencia ? asistencia.hora : null // Si tienes columna hora
                };
            }) as Costalero[]);

            setLoading(false);
        };
        fetchData();
    }, [params.id]);

    const updateStatus = async (newStatus: 'presente' | 'justificado' | 'ausente' | 'delete') => {
        if (!selectedCostalero) return;
        // removing setLoading(true) to avoid UI flicker on optimistic update

        const { data: evento } = await supabase.from("eventos").select("fecha_inicio").eq("id", params.id).single();
        if (!evento) return;
        const eventDate = new Date(evento.fecha_inicio).toISOString().split('T')[0];

        // Optimistic Update
        if (newStatus === 'delete') {
            setCuadrilla(prev => prev.map(c =>
                c.id === selectedCostalero.id ? { ...c, estado: undefined } : c
            ));
        } else {
            setCuadrilla(prev => prev.map(c =>
                c.id === selectedCostalero.id ? { ...c, estado: newStatus } : c
            ));
        }
        setSelectedCostalero(null);

        if (newStatus === 'delete') {
            await supabase.from("asistencias").delete().eq("costalero_id", selectedCostalero.id).eq("fecha", eventDate);
        } else {
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
                console.error(error);
                alert("Error: " + error.message);
            }
        }
    };

    const groups = [1, 2, 3, 4, 5, 6, 7];

    if (loading) return (
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
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 line-clamp-1">Trabajaderas - {eventoTitulo}</h1>
            </header>

            {/* Secciones por Trabajadera */}
            <div className="space-y-12">
                {groups.map(t => {
                    const members = cuadrilla.filter(c => c.trabajadera === t);
                    const presentes = members.filter(m => m.estado === 'presente').length;
                    const pct = members.length > 0 ? Math.round((presentes / members.length) * 100) : 0;
                    if (members.length === 0) return null;

                    return (
                        <div key={t} className="space-y-5">
                            <div className="flex justify-between items-end px-2">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-primary uppercase tracking-tighter italic">TRABAJADERA {t}</h2>
                                    <p className="text-[10px] text-neutral-400 font-black tracking-widest uppercase">{presentes}/{members.length} PRESENTES</p>
                                </div>
                                <div className="px-4 py-1.5 bg-white border border-black/5 rounded-full text-neutral-400 font-black text-[10px] shadow-sm">
                                    {pct}%
                                </div>
                            </div>

                            <div className="space-y-3">
                                {members.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedCostalero(m)}
                                        className={cn(
                                            "w-full bg-white p-5 rounded-[24px] flex justify-between items-center transition-all border shadow-sm active:scale-[0.98]",
                                            m.estado === 'presente' ? "border-emerald-500/20 shadow-emerald-500/5" : "border-black/5"
                                        )}
                                    >
                                        <div className="space-y-3 text-left">
                                            <h3 className="font-extrabold text-neutral-900 text-lg tracking-tight italic">{m.nombre} {m.apellidos}</h3>

                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                                m.estado === 'presente' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                                                m.estado === 'justificado' && "bg-amber-50 text-amber-600 border-amber-100",
                                                m.estado === 'ausente' && "bg-red-50 text-red-600 border-red-100",
                                                !m.estado && "bg-neutral-50 text-neutral-400 border-neutral-100"
                                            )}>
                                                {m.estado === 'presente' && <CheckCircle2 size={10} />}
                                                {m.estado === 'justificado' && <FileText size={10} />}
                                                {m.estado === 'ausente' && <XCircle size={10} />}
                                                {m.estado || "PENDIENTE"}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {m.hora && <span className="text-[10px] font-bold text-neutral-300 font-mono italic">{m.hora}</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
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
                                <Trash2 className="mr-2" size={16} /> LIMPIAR ESTADO
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
