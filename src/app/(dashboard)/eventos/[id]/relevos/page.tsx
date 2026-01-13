"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Plus, Search, Check, UserPlus, Trash2, ArrowLeftRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
    presente: boolean;
}

interface Relevo {
    id: string;
    trabajadera: number;
    posicion: number;
    costalero_id: string | null;
    costalero?: Costalero;
}

export default function GestionRelevos() {
    const params = useParams();
    const router = useRouter();
    const [relevos, setRelevos] = useState<Relevo[]>([]);
    const [cuadrilla, setCuadrilla] = useState<Costalero[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPos, setSelectedPos] = useState<{ t: number, p: number } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchOther, setSearchOther] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const totalHuecos = 35; // 7 trabajaderas * 5 huecos

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        const { data: evento } = await supabase.from("eventos").select("fecha_inicio").eq("id", params.id).single();
        if (!evento) return;

        const dateObj = new Date(evento.fecha_inicio);
        const eventDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

        const [relevosRes, costalerosRes, asistenciasRes] = await Promise.all([
            supabase.from("relevos").select("*, costalero:costaleros(*)").eq("evento_id", params.id),
            supabase.from("costaleros").select("*"),
            supabase.from("asistencias").select("*").eq("fecha", eventDate).eq("estado", "presente")
        ]);

        const presentIds = new Set(asistenciasRes.data?.map(a => a.costalero_id) || []);
        const formattedCuadrilla = (costalerosRes.data || []).map(c => ({
            ...c,
            presente: presentIds.has(c.id)
        }));

        setCuadrilla(formattedCuadrilla);
        setRelevos(relevosRes.data || []);
        setLoading(false);
    };

    const getCostaleroAt = (t: number, p: number) => {
        return relevos.find(r => r.trabajadera === t && r.posicion === p)?.costalero;
    };

    const handlePosClick = async (t: number, p: number) => {
        const costalero = getCostaleroAt(t, p);

        // Caso 1: Ya hay uno seleccionado (Lógica de SWAP o MOVER)
        if (selectedPos) {
            if (selectedPos.t === t && selectedPos.p === p) {
                setSelectedPos(null);
                return;
            }

            const sourceCostalero = getCostaleroAt(selectedPos.t, selectedPos.p);
            if (!sourceCostalero) {
                setSelectedPos({ t, p });
                return;
            }

            setLoading(true);

            // Si el destino tiene a alguien, intercambiamos. Si no, solo movemos.
            const targetCostalero = getCostaleroAt(t, p);

            const op1 = supabase.from("relevos").upsert({
                evento_id: params.id,
                trabajadera: t,
                posicion: p,
                costalero_id: sourceCostalero.id
            }, { onConflict: "evento_id,trabajadera,posicion" });

            let op2;
            if (targetCostalero) {
                op2 = supabase.from("relevos").upsert({
                    evento_id: params.id,
                    trabajadera: selectedPos.t,
                    posicion: selectedPos.p,
                    costalero_id: targetCostalero.id
                }, { onConflict: "evento_id,trabajadera,posicion" });
            } else {
                // Limpiar el origen si estaba moviendo a un hueco vacío
                op2 = supabase.from("relevos").delete().eq("evento_id", params.id).eq("trabajadera", selectedPos.t).eq("posicion", selectedPos.p);
            }

            await Promise.all([op1, op2]);
            setSelectedPos(null);
            await fetchData();
            return;
        }

        // Caso 2: Nadie seleccionado.
        if (costalero) {
            setSelectedPos({ t, p });
        } else {
            // Hueco vacío: Abrir modal de asignación
            setSelectedPos({ t, p });
            setShowModal(true);
        }
    };

    const assignCostalero = async (cid: string | null) => {
        if (!selectedPos) return;
        setLoading(true);

        if (cid) {
            // Si el costalero ya estaba en otra posición, limpiar esa posición primero
            await supabase.from("relevos").delete().eq("evento_id", params.id).eq("costalero_id", cid);

            await supabase.from("relevos").upsert({
                evento_id: params.id,
                trabajadera: selectedPos.t,
                posicion: selectedPos.p,
                costalero_id: cid
            }, { onConflict: "evento_id,trabajadera,posicion" });
        } else {
            await supabase.from("relevos").delete().eq("evento_id", params.id).eq("trabajadera", selectedPos.t).eq("posicion", selectedPos.p);
        }

        setShowModal(false);
        setSelectedPos(null);
        setSearchTerm("");
        await fetchData();
    };

    const occupadas = relevos.filter(r => r.costalero_id).length;
    const pct = (occupadas / totalHuecos) * 100;

    const filteredCandidates = cuadrilla
        .filter(c => c.presente) // Solo los que han venido
        .filter(c => !relevos.some(r => r.costalero_id === c.id)) // Que no estén ya puestos
        .filter(c => searchOther || c.trabajadera === selectedPos?.t) // Filtrar por trabajadera si no se marca buscar en otras
        .filter(c => `${c.nombre} ${c.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading && relevos.length === 0) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    const huecosLabels = ["Patero Izq", "Patero Der", "Fijador Izq", "Fijador Der", "Corriente"];

    return (
        <div className="min-h-screen pb-32 bg-[#FAFAFA] animate-in fade-in duration-700">
            {/* Top Bar */}
            <div className="p-6 pb-0 space-y-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Configuración Paso</h1>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-neutral-900 tracking-tighter italic">{occupadas}/{totalHuecos} Huecos</h3>
                            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Formación táctica en tiempo real</p>
                        </div>
                        <div className="px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-primary font-black text-[10px] shadow-sm">
                            {Math.round(pct)}% LLENO
                        </div>
                    </div>
                    <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden border border-black/5">
                        <div
                            className="h-full bg-primary shadow-[0_0_15px_rgba(128,0,32,0.3)] transition-all duration-1000 ease-out"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Tactical Grid */}
            <div className="p-6 space-y-12 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map((t) => (
                    <div key={t} className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                            <h2 className="text-xl font-black text-neutral-400 uppercase tracking-tighter italic">TRABAJADERA {t}</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((p) => {
                                const costalero = getCostaleroAt(t, p);
                                const isSelected = selectedPos?.t === t && selectedPos?.p === p;
                                return (
                                    <button
                                        key={`${t}-${p}`}
                                        onClick={() => handlePosClick(t, p)}
                                        className={cn(
                                            "relative p-5 rounded-[24px] border-2 transition-all flex flex-col justify-center space-y-1 h-28 text-left",
                                            isSelected ? "border-primary bg-primary/5 shadow-lg scale-105 z-10" :
                                                costalero ? "bg-white border-neutral-100 shadow-sm" : "bg-neutral-50/50 border-dashed border-neutral-200"
                                        )}
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{huecosLabels[p - 1]}</span>
                                        <span className={cn(
                                            "font-extrabold text-sm italic line-clamp-2",
                                            costalero ? "text-primary" : "text-neutral-300 font-medium"
                                        )}>
                                            {costalero ? `${costalero.nombre} ${costalero.apellidos}` : 'Asignar...'}
                                        </span>
                                        {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />}
                                    </button>
                                );
                            })}

                            {/* Corriente (Position 5) */}
                            <div className="col-span-2 flex justify-center pt-2">
                                <button
                                    onClick={() => handlePosClick(t, 5)}
                                    className={cn(
                                        "w-full max-w-[240px] p-5 rounded-[24px] border-2 transition-all flex flex-col justify-center space-y-1 h-28 text-center",
                                        selectedPos?.t === t && selectedPos?.p === 5 ? "border-primary bg-primary/5 shadow-lg scale-105 z-10" :
                                            getCostaleroAt(t, 5) ? "bg-white border-neutral-100 shadow-sm" : "bg-neutral-50/50 border-dashed border-neutral-200"
                                    )}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">CORRIENTE</span>
                                    <span className={cn(
                                        "font-extrabold text-sm italic",
                                        getCostaleroAt(t, 5) ? "text-primary" : "text-neutral-300 font-medium"
                                    )}>
                                        {getCostaleroAt(t, 5) ? `${getCostaleroAt(t, 5)?.nombre} ${getCostaleroAt(t, 5)?.apellidos}` : 'Sin asignar'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Selección */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setShowModal(false); setSelectedPos(null); }}>
                    <div className="w-full max-w-sm bg-white rounded-t-[40px] p-8 pb-32 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="text-center space-y-2">
                            <div className="w-16 h-1 w-12 bg-neutral-100 rounded-full mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight italic">Hueco Disponibles</h3>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Trabajadera {selectedPos?.t} • {huecosLabels[(selectedPos?.p || 1) - 1]}</p>
                        </div>

                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    className="pl-10 h-12 bg-neutral-50 border-none rounded-2xl"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={() => setSearchOther(!searchOther)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    searchOther ? "bg-primary/5 border-primary text-primary" : "bg-white border-black/5 text-neutral-400"
                                )}
                            >
                                <span className="text-xs font-black uppercase tracking-widest">Buscar en otras trabajaderas</span>
                                {searchOther ? <Check size={16} /> : <div className="w-4 h-4 border-2 border-neutral-100 rounded" />}
                            </button>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredCandidates.length === 0 ? (
                                    <div className="text-center py-10 opacity-40 italic text-sm">No hay costaleros libres</div>
                                ) : (
                                    filteredCandidates.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => assignCostalero(c.id)}
                                            className="w-full p-4 bg-neutral-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-primary/20 rounded-2xl flex items-center justify-between group transition-all"
                                        >
                                            <div className="text-left">
                                                <p className="font-extrabold text-neutral-900 group-hover:text-primary">{c.nombre} {c.apellidos}</p>
                                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">T-{c.trabajadera} • {c.puesto}</p>
                                            </div>
                                            <UserPlus size={18} className="text-neutral-300 group-hover:text-primary" />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="h-14 border-red-100 text-red-500 rounded-2xl font-black text-xs uppercase"
                            onClick={() => assignCostalero(null)}
                        >
                            <Trash2 size={16} className="mr-2" /> Dejar hueco vacío
                        </Button>
                    </div>
                </div>
            )}

            {/* Float Help */}
            {selectedPos && !showModal && (
                <div className="fixed bottom-6 right-6 z-40 w-full max-w-[320px]">
                    <div className="bg-neutral-900 border border-white/10 p-5 rounded-[28px] shadow-2xl flex items-center justify-between text-white animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-xl">
                                <ArrowLeftRight size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black uppercase tracking-tight truncate">{getCostaleroAt(selectedPos.t, selectedPos.p)?.nombre || 'Hueco'}</p>
                                <p className="text-[8px] text-neutral-400 font-bold leading-tight">Toca destino para mover o intercambiar</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedPos(null)} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors px-2 ml-2">
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
