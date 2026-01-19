"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Search, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
}

interface Medicion {
    costalero_id: string;
    altura_pre: number | null;
    altura_post: number | null;
}

export default function MedicionesPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [costaleros, setCostaleros] = useState<Costalero[]>([]);
    const [mediciones, setMediciones] = useState<Record<string, Medicion>>({});
    const [originalMediciones, setOriginalMediciones] = useState<Record<string, Medicion>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [eventTitle, setEventTitle] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Event Info
            const { data: eventData } = await supabase
                .from("eventos")
                .select("titulo")
                .eq("id", params.id)
                .single();
            if (eventData) setEventTitle(eventData.titulo);

            // 2. Fetch Active Costaleros
            const { data: costalerosData } = await supabase
                .from("costaleros")
                .select("id, nombre, apellidos, trabajadera, puesto")
                .eq("rol", "costalero")
                .order("trabajadera", { ascending: true })
                .order("puesto", { ascending: true }); // Then by puesto/height logic roughly

            if (costalerosData) {
                // Secondary sort by surnames just in case
                const sorted = costalerosData.sort((a, b) => {
                    if (a.trabajadera !== b.trabajadera) return a.trabajadera - b.trabajadera;
                    return a.apellidos.localeCompare(b.apellidos);
                });
                setCostaleros(sorted);
            }

            // 3. Fetch Existing Measurements
            const { data: medicionesData } = await supabase
                .from("mediciones_ensayo")
                .select("costalero_id, altura_pre, altura_post")
                .eq("evento_id", params.id);

            if (medicionesData) {
                const map: Record<string, Medicion> = {};
                medicionesData.forEach(m => {
                    map[m.costalero_id] = m;
                });
                setMediciones(map);
                setOriginalMediciones(JSON.parse(JSON.stringify(map)));
            }

        } catch (e) {
            console.error("Error fetching data:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAlturaChange = (costaleroId: string, field: 'altura_pre' | 'altura_post', value: string) => {
        const numValue = value === "" ? null : parseFloat(value);
        setMediciones(prev => ({
            ...prev,
            [costaleroId]: {
                ...prev[costaleroId],
                costalero_id: costaleroId,
                [field]: numValue
            }
        }));
    };

    const handleBlur = async (costaleroId: string, field: 'altura_pre' | 'altura_post') => {
        const currentVal = mediciones[costaleroId]?.[field];
        const originalVal = originalMediciones[costaleroId]?.[field];
        const costalero = costaleros.find(c => c.id === costaleroId);

        // Si el valor no ha cambiado, no hacer nada
        if (currentVal === originalVal) return;

        // Si el valor ha cambiado, pedir confirmación y guardar
        const fieldName = field === 'altura_pre' ? 'Pre-Ensayo' : 'Post-Ensayo';
        const confirmMsg = `¿Guardar altura ${fieldName} para ${costalero?.nombre} ${costalero?.apellidos}?`;

        if (window.confirm(confirmMsg)) {
            try {
                const medicion = mediciones[costaleroId];
                const { error } = await supabase
                    .from("mediciones_ensayo")
                    .upsert({
                        evento_id: params.id,
                        costalero_id: costaleroId,
                        altura_pre: medicion.altura_pre,
                        altura_post: medicion.altura_post,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'evento_id, costalero_id' });

                if (error) throw error;

                // Actualizar el estado 'original' para evitar pedir confirmación de nuevo si no cambia más
                setOriginalMediciones(prev => ({
                    ...prev,
                    [costaleroId]: { ...medicion }
                }));
                // Opcional: Feedback visual discreto (toast no tenemos, alert quizás molesto si ya confirmó)
            } catch (e: any) {
                alert("Error al guardar: " + e.message);
            }
        } else {
            // Si cancela, revertir al valor original (opcional, el usuario suele preferir mantener el dato editado por si acaso)
            // En este caso, dejamos el dato editado pero SIN guardar en BD.
        }
    };

    const guardarMediciones = async () => {
        setSaving(true);
        try {
            const updates = Object.values(mediciones).map(m => ({
                evento_id: params.id,
                costalero_id: m.costalero_id,
                altura_pre: m.altura_pre,
                altura_post: m.altura_post,
                updated_at: new Date().toISOString()
            }));

            // Process in chunks or individually (upsert handles bulk mostly)
            if (updates.length > 0) {
                const { error } = await supabase
                    .from("mediciones_ensayo")
                    .upsert(updates, { onConflict: 'evento_id, costalero_id' });

                if (error) throw error;
            }

            alert("¡Mediciones guardadas correctamente!");
        } catch (e: any) {
            console.error("Error saving:", e);
            alert("Error al guardar: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredCostaleros = costaleros.filter(c =>
        `${c.nombre} ${c.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.trabajadera.toString().includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 bg-white border border-black/5 rounded-full hover:bg-neutral-100 transition-colors"
                >
                    <ArrowLeft size={20} className="text-neutral-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-black uppercase tracking-tight text-neutral-900 line-clamp-1">
                        Mediciones
                    </h1>
                    <p className="text-xs font-bold text-primary truncate">{eventTitle}</p>
                </div>
            </header>

            <div className="p-6 space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <Input
                        placeholder="Buscar costalero..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-12 rounded-2xl bg-white border-black/5 shadow-sm text-base"
                    />
                </div>

                {/* List */}
                <div className="space-y-3">
                    {filteredCostaleros.map(costalero => {
                        const medicion = mediciones[costalero.id] || { altura_pre: '', altura_post: '' };
                        return (
                            <div key={costalero.id} className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                                                T{costalero.trabajadera}
                                            </span>
                                            <h3 className="font-extrabold text-neutral-900 text-sm">
                                                {costalero.apellidos}, {costalero.nombre}
                                            </h3>
                                        </div>
                                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wide pl-1">
                                            {costalero.puesto}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-neutral-50 rounded-xl p-3">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block text-center">
                                            Pre-Ensayo
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                placeholder="0.0"
                                                value={medicion.altura_pre ?? ''}
                                                onChange={(e) => handleAlturaChange(costalero.id, 'altura_pre', e.target.value)}
                                                onBlur={() => handleBlur(costalero.id, 'altura_pre')}
                                                className="w-full text-center bg-white border border-neutral-200 rounded-lg py-2 text-sm font-bold text-neutral-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                            <span className="absolute right-3 top-2 text-[10px] text-neutral-400 font-bold">cm</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block text-center">
                                            Post-Ensayo
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                placeholder="0.0"
                                                value={medicion.altura_post ?? ''}
                                                onChange={(e) => handleAlturaChange(costalero.id, 'altura_post', e.target.value)}
                                                onBlur={() => handleBlur(costalero.id, 'altura_post')}
                                                className="w-full text-center bg-white border border-neutral-200 rounded-lg py-2 text-sm font-bold text-neutral-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                            <span className="absolute right-3 top-2 text-[10px] text-neutral-400 font-bold">cm</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredCostaleros.length === 0 && (
                        <div className="text-center py-10 text-neutral-400 italic">
                            No se encontraron costaleros
                        </div>
                    )}
                </div>

                {/* Save Button Inline */}
                <div className="pt-4 pb-8">
                    <Button
                        onClick={guardarMediciones}
                        disabled={saving}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transform transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        {saving ? "Guardando..." : "Guardar Mediciones"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
