"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Save, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PerfilTrabajadera {
    trabajadera: number;
    altura_cm: number;
}

export default function DatosPalioPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [temporadaActiva, setTemporadaActiva] = useState<string | null>(null);
    const [temporadaId, setTemporadaId] = useState<string | null>(null);
    const [alturas, setAlturas] = useState<PerfilTrabajadera[]>([
        { trabajadera: 1, altura_cm: 155 },
        { trabajadera: 2, altura_cm: 152.5 },
        { trabajadera: 3, altura_cm: 151 },
        { trabajadera: 4, altura_cm: 149 },
        { trabajadera: 5, altura_cm: 146 },
        { trabajadera: 6, altura_cm: 143 },
        { trabajadera: 7, altura_cm: 143 },
    ]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener temporada activa
            const { data: tempData } = await supabase
                .from("temporadas")
                .select("id, nombre")
                .eq("activa", true)
                .single();

            if (tempData) {
                setTemporadaActiva(tempData.nombre);
                setTemporadaId(tempData.id);

                // Intentar cargar datos existentes
                const { data: perfilData } = await supabase
                    .from("perfil_trabajaderas")
                    .select("trabajadera, altura_cm")
                    .eq("temporada_id", tempData.id)
                    .order("trabajadera", { ascending: true });

                if (perfilData && perfilData.length === 7) {
                    setAlturas(perfilData);
                }
            }
        } catch (e) {
            console.error("Error fetching data:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleAlturaChange = (trabajadera: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setAlturas(prev =>
            prev.map(a =>
                a.trabajadera === trabajadera ? { ...a, altura_cm: numValue } : a
            )
        );
    };

    const getDiferencia = (index: number): number | null => {
        if (index >= alturas.length - 1) return null;
        return alturas[index + 1].altura_cm - alturas[index].altura_cm;
    };

    const guardarDatos = async () => {
        if (!temporadaId) return;
        setSaving(true);

        try {
            // Upsert cada trabajadera
            for (const altura of alturas) {
                await supabase
                    .from("perfil_trabajaderas")
                    .upsert({
                        temporada_id: temporadaId,
                        trabajadera: altura.trabajadera,
                        altura_cm: altura.altura_cm
                    }, { onConflict: "temporada_id,trabajadera" });
            }

            alert(`¡Datos guardados correctamente para la temporada ${temporadaActiva}!`);
        } catch (e) {
            console.error("Error saving:", e);
            alert("Error al guardar los datos");
        } finally {
            setSaving(false);
        }
    };

    // Calcular valores para el gráfico
    const maxAltura = Math.max(...alturas.map(a => a.altura_cm));
    const minAltura = Math.min(...alturas.map(a => a.altura_cm));
    const range = maxAltura - minAltura || 1;
    const chartHeight = 150;
    const chartWidth = 280;
    const padding = 30;

    const getPointY = (altura: number): number => {
        return padding + ((maxAltura - altura) / range) * (chartHeight - padding * 2);
    };

    const points = alturas.map((a, i) => ({
        x: padding + (i * (chartWidth - padding * 2)) / 6,
        y: getPointY(a.altura_cm),
        altura: a.altura_cm
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 bg-background animate-in fade-in duration-700">
            {/* Header */}
            <div className="p-6 pb-0">
                <header className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-900 hover:text-black transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
                        Datos Palio
                    </h1>
                </header>

                {/* Título con temporada */}
                <div className="mb-6">
                    <h2 className="text-xl font-black text-neutral-900">Perfil de Trabajaderas</h2>
                    <p className="text-sm font-bold text-primary">{temporadaActiva || "Sin temporada activa"}</p>
                </div>

                {/* Gráfico de línea */}
                <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-4 mb-6">
                    <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
                        {/* Líneas de guía horizontales */}
                        {[0, 1, 2, 3, 4].map(i => {
                            const y = padding + (i * (chartHeight - padding * 2)) / 4;
                            return (
                                <line
                                    key={i}
                                    x1={padding}
                                    y1={y}
                                    x2={chartWidth - padding}
                                    y2={y}
                                    stroke="#e5e5e5"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* Línea del perfil */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#14b8a6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Puntos y etiquetas */}
                        {points.map((p, i) => (
                            <g key={i}>
                                {/* Punto */}
                                <circle cx={p.x} cy={p.y} r="5" fill="#14b8a6" />

                                {/* Altura */}
                                <text
                                    x={p.x}
                                    y={p.y - 12}
                                    textAnchor="middle"
                                    className="text-[9px] font-bold fill-neutral-700"
                                >
                                    {p.altura}
                                </text>

                                {/* Diferencia entre puntos */}
                                {i < points.length - 1 && (
                                    <text
                                        x={(p.x + points[i + 1].x) / 2}
                                        y={(p.y + points[i + 1].y) / 2 - 5}
                                        textAnchor="middle"
                                        className="text-[8px] font-bold fill-neutral-400"
                                    >
                                        {getDiferencia(i)?.toFixed(1)}
                                    </text>
                                )}

                                {/* T1, T2, etc. */}
                                <text
                                    x={p.x}
                                    y={chartHeight - 5}
                                    textAnchor="middle"
                                    className="text-[10px] font-black fill-neutral-500"
                                >
                                    T{i + 1}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Ajuste de Alturas */}
                <div className="mb-6">
                    <h3 className="text-lg font-black text-neutral-900 mb-1">Ajuste de Alturas (cm)</h3>
                    <p className="text-xs text-neutral-500 mb-4">
                        Introduce la diferencia en cm de cada trabajadera respecto a la referencia (normalmente T1 o suelo).
                    </p>

                    <div className="space-y-0">
                        {alturas.map((altura, index) => {
                            const diferencia = getDiferencia(index);
                            return (
                                <div key={altura.trabajadera}>
                                    {/* Fila de input */}
                                    <div className="bg-white rounded-xl border border-black/5 shadow-sm p-4 flex items-center justify-between">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-sm font-black text-primary">T{altura.trabajadera}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={altura.altura_cm}
                                                onChange={(e) => handleAlturaChange(altura.trabajadera, e.target.value)}
                                                className="w-24 text-right text-xl font-black text-neutral-900 bg-transparent border-none outline-none"
                                            />
                                            <span className="text-sm text-neutral-400 font-medium">cm</span>
                                        </div>
                                    </div>

                                    {/* Diferencia entre trabajaderas */}
                                    {diferencia !== null && (
                                        <div className="text-center py-2">
                                            <span className={cn(
                                                "text-xs font-bold",
                                                diferencia < 0 ? "text-red-500" : diferencia > 0 ? "text-emerald-500" : "text-neutral-400"
                                            )}>
                                                {diferencia > 0 ? "+" : ""}{diferencia.toFixed(1)} cm
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Botón Guardar Flotante */}
            {/* Botón Guardar Flotante */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-50">
                <Button
                    onClick={guardarDatos}
                    disabled={saving || !temporadaId}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transform transition-transform active:scale-95"
                >
                    <Save size={18} className="mr-2" />
                    {saving ? "Guardando..." : "Guardar Datos"}
                </Button>
            </div>
        </div>
    );
}
