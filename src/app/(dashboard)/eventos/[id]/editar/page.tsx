"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    Calendar,
    Clock,
    Type,
    MapPin,
    AlignLeft,
    Check,
    Save
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EditarEvento() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        titulo: "",
        descripcion: "",
        ubicacion: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        tipo: "Ensayo"
    });

    useEffect(() => {
        const fetchEvento = async () => {
            const { data, error } = await supabase
                .from("eventos")
                .select("*")
                .eq("id", params.id)
                .single();

            if (data) {
                const dateObj = new Date(data.fecha_inicio);
                const fechaStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                const horaInicioStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

                let horaFinStr = "";
                if (data.fecha_fin) {
                    const dateFinObj = new Date(data.fecha_fin);
                    horaFinStr = `${String(dateFinObj.getHours()).padStart(2, '0')}:${String(dateFinObj.getMinutes()).padStart(2, '0')}`;
                }

                setForm({
                    titulo: data.titulo || "",
                    descripcion: data.descripcion || "",
                    ubicacion: data.ubicacion || "",
                    fecha: fechaStr,
                    hora_inicio: horaInicioStr,
                    hora_fin: horaFinStr,
                    tipo: data.tipo || "Ensayo"
                });
            }
            setLoading(false);
        };
        fetchEvento();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const fechaInicio = `${form.fecha}T${form.hora_inicio}:00`;
            const fechaFin = form.hora_fin ? `${form.fecha}T${form.hora_fin}:00` : null;

            const { error } = await supabase
                .from("eventos")
                .update({
                    titulo: form.titulo,
                    descripcion: form.descripcion || null,
                    ubicacion: form.ubicacion || null,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    tipo: form.tipo
                })
                .eq("id", params.id);

            if (error) {
                alert(`Error al actualizar el evento: ${error.message}`);
                return;
            }

            router.push(`/eventos/${params.id}`);
        } catch (err: any) {
            alert(`Error inesperado: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Editar Evento</h1>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Modificar Convocatoria</p>
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
                    disabled={saving}
                    type="submit"
                    className="w-full h-16 rounded-[24px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all active:scale-95"
                >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                    {!saving && <Save className="ml-2" size={20} />}
                </Button>
            </form>
        </div>
    );
}
