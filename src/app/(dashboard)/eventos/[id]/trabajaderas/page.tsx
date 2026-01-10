"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    FileText
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

    useEffect(() => {
        const fetchData = async () => {
            const { data: evento } = await supabase.from("eventos").select("titulo").eq("id", params.id).single();
            if (evento) setEventoTitulo(evento.titulo);

            const { data: costaleros } = await supabase.from("costaleros").select("*").order("trabajadera").order("apellidos");
            if (costaleros) {
                setCuadrilla(costaleros.map((c, i) => ({
                    ...c,
                    estado: i % 5 === 0 ? 'presente' : i % 8 === 0 ? 'justificado' : 'ausente',
                    hora: '09:00'
                })) as Costalero[]);
            }
            setLoading(false);
        };
        fetchData();
    }, [params.id]);

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
                                    <div
                                        key={m.id}
                                        className={cn(
                                            "bg-white p-5 rounded-[24px] flex justify-between items-center transition-all border shadow-sm",
                                            m.estado === 'presente' ? "border-emerald-500/20 shadow-emerald-500/5" : "border-black/5"
                                        )}
                                    >
                                        <div className="space-y-3">
                                            <h3 className="font-extrabold text-neutral-900 text-lg tracking-tight italic">{m.nombre} {m.apellidos}</h3>

                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                                                m.estado === 'presente' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                                                m.estado === 'justificado' && "bg-amber-50 text-amber-600 border-amber-100",
                                                m.estado === 'ausente' && "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {m.estado === 'presente' && <CheckCircle2 size={10} />}
                                                {m.estado === 'justificado' && <FileText size={10} />}
                                                {m.estado === 'ausente' && <XCircle size={10} />}
                                                {m.estado}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-neutral-300 font-mono italic">{m.hora}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
