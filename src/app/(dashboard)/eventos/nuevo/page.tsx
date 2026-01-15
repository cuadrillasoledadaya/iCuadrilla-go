"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    ArrowLeft,
    Calendar,
    Clock,
    Type,
    MapPin,
    AlignLeft,
    Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NuevoEvento() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        titulo: "",
        descripcion: "",
        ubicacion: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        tipo: "Ensayo"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Crear objeto Date local y convertir a ISO (UTC) para Supabase
            const localInicio = new Date(`${form.fecha}T${form.hora_inicio}:00`);
            const fechaInicio = localInicio.toISOString();

            let fechaFin = null;
            if (form.hora_fin) {
                const localFin = new Date(`${form.fecha}T${form.hora_fin}:00`);
                fechaFin = localFin.toISOString();
            }

            const { error } = await supabase.from("eventos").insert({
                titulo: form.titulo,
                descripcion: form.descripcion || null,
                ubicacion: form.ubicacion || null,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                tipo: form.tipo,
                estado: "pendiente"
            });

            if (error) {
                console.error("Error Supabase:", error);
                alert(`Error al crear el evento: ${error.message}`);
                return;
            }

            router.push("/eventos");
        } catch (err: unknown) {
            console.error("Error inesperado:", err);
            const errorMessage = err instanceof Error ? err.message : "Error desconocido";
            alert(`Error al crear el evento: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 group/back z-10"
                >
                    <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Crear Evento</h1>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Nueva Convocatoria</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título y Tipo */}
                <div className="space-y-4">
                    <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <Input
                            required
                            placeholder="Título del evento"
                            className="bg-white pl-12 h-14 border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'Ensayo', label: 'ENSAYO' },
                            { value: 'Salida', label: 'SALIDA' },
                            { value: 'Igualá', label: 'IGUALÁ' },
                            { value: 'Otro', label: 'OTRO' }
                        ].map((tipo) => (
                            <button
                                key={tipo.value}
                                type="button"
                                onClick={() => setForm({ ...form, tipo: tipo.value })}
                                className={cn(
                                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                    form.tipo === tipo.value
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-white text-neutral-400 border-black/5 hover:border-primary/20"
                                )}
                            >
                                {tipo.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fecha y Horas */}
                <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={16} className="text-primary" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Fecha y Horario</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            required
                            type="date"
                            className="bg-neutral-50 h-14 border-black/5 rounded-2xl text-neutral-900"
                            value={form.fecha}
                            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-neutral-400 uppercase ml-2">Inicio</label>
                            <Input
                                required
                                type="time"
                                className="bg-neutral-50 h-14 border-black/5 rounded-2xl text-neutral-900"
                                value={form.hora_inicio}
                                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-neutral-400 uppercase ml-2">Fin (Opcional)</label>
                            <Input
                                type="time"
                                className="bg-neutral-50 h-14 border-black/5 rounded-2xl text-neutral-900"
                                value={form.hora_fin}
                                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Ubicación y Descripción */}
                <div className="space-y-4">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <Input
                            placeholder="Ubicación / Lugar"
                            className="bg-white pl-12 h-14 border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400"
                            value={form.ubicacion}
                            onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                        />
                    </div>

                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 text-neutral-400" size={18} />
                        <textarea
                            placeholder="Descripción adicional..."
                            rows={4}
                            className="w-full bg-white pl-12 p-4 border border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>
                </div>

                <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all active:scale-95"
                >
                    {loading ? "Creando..." : "Publicar Evento"}
                    {!loading && <Check className="ml-2" size={20} />}
                </Button>
            </form>
        </div>
    );
}
