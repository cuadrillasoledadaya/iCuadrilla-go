"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Plus, Search, Check, UserPlus, Trash2, ArrowLeftRight, Settings2 } from "lucide-react";
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
    estadoAsistencia: 'presente' | 'ausente' | 'justificado' | 'pendiente';
    suplemento?: number;
}

interface Relevo {
    id: string;
    trabajadera: number;
    posicion: number;
    costalero_id: string | null;
    muda_id: string;
    suplemento?: number;
    costalero?: Costalero;
}

interface Muda {
    id: string;
    nombre: string;
    orden: number;
}

export default function GestionRelevos() {
    const params = useParams();
    const router = useRouter();
    const [relevos, setRelevos] = useState<Relevo[]>([]);
    const [cuadrilla, setCuadrilla] = useState<Costalero[]>([]);
    const [mudas, setMudas] = useState<Muda[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMudaId, setActiveMudaId] = useState<string | null>(null);
    const [selectedPos, setSelectedPos] = useState<{ t: number, p: number } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showMudaModal, setShowMudaModal] = useState(false);
    const [mudaNameInput, setMudaNameInput] = useState("");
    const [editingMuda, setEditingMuda] = useState<Muda | null>(null);
    const [searchOther, setSearchOther] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [assignmentSupplement, setAssignmentSupplement] = useState("");

    const totalHuecos = 35; // 7 trabajaderas * 5 huecos

    useEffect(() => {
        fetchInitialData();
    }, [params.id]);

    useEffect(() => {
        if (activeMudaId) {
            fetchRelevos();
        }
    }, [activeMudaId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Mudas
            let { data: mudasData } = await supabase.from("muda_nombres")
                .select("*")
                .eq("evento_id", params.id)
                .order("orden", { ascending: true });

            if (!mudasData || mudasData.length === 0) {
                // Crear una muda por defecto si no hay ninguna
                const { data: newMuda } = await supabase.from("muda_nombres").insert({
                    evento_id: params.id,
                    nombre: "Salida",
                    orden: 1
                }).select().single();

                if (newMuda) {
                    mudasData = [newMuda];
                }
            }

            setMudas(mudasData || []);
            if (mudasData && mudasData.length > 0) {
                setActiveMudaId(mudasData[0].id);
            }

            // 2. Costaleros y Asistencias - filtrar por evento_id para independencia total
            const [costalerosRes, asistenciasRes] = await Promise.all([
                supabase.from("costaleros").select("*").eq("rol", "costalero"),
                supabase.from("asistencias").select("costalero_id, estado").eq("evento_id", params.id)
            ]);

            // Crear mapa de estados de asistencia
            const asistenciaMap = new Map<string, string>();
            asistenciasRes.data?.forEach(a => {
                asistenciaMap.set(a.costalero_id, a.estado);
            });

            const formattedCuadrilla = (costalerosRes.data || []).map(c => {
                const estado = asistenciaMap.get(c.id);
                return {
                    ...c,
                    estadoAsistencia: estado === 'presente' ? 'presente' :
                        estado === 'ausente' ? 'ausente' :
                            (estado === 'justificado' || estado === 'justificada') ? 'justificado' :
                                'pendiente' as const
                };
            });
            setCuadrilla(formattedCuadrilla);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelevos = async () => {
        if (!activeMudaId) return;
        const { data } = await supabase.from("relevos")
            .select("*, costalero:costaleros(*)")
            .eq("evento_id", params.id)
            .eq("muda_id", activeMudaId);
        setRelevos(data || []);
    };

    const getCostaleroAt = (t: number, p: number) => {
        const relevo = relevos.find(r => r.trabajadera === t && r.posicion === p);
        if (!relevo?.costalero) return null;
        // Buscar el estado de asistencia en la cuadrilla
        const cuadrillaData = cuadrilla.find(c => c.id === relevo.costalero_id);
        return {
            ...relevo.costalero,
            estadoAsistencia: cuadrillaData?.estadoAsistencia || 'pendiente'
        };
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

            // Operaciones atómicas
            const ops = [];

            // 1. Movemos el origen al destino
            ops.push(supabase.from("relevos").upsert({
                evento_id: params.id,
                trabajadera: t,
                posicion: p,
                costalero_id: sourceCostalero.id,
                muda_id: activeMudaId
            }, { onConflict: "evento_id,trabajadera,posicion,muda_id" }));

            if (targetCostalero) {
                // 2. Si el destino tenía a alguien, lo movemos al origen
                ops.push(supabase.from("relevos").upsert({
                    evento_id: params.id,
                    trabajadera: selectedPos.t,
                    posicion: selectedPos.p,
                    costalero_id: targetCostalero.id,
                    muda_id: activeMudaId
                }, { onConflict: "evento_id,trabajadera,posicion,muda_id" }));
            } else {
                // 3. Si el destino estaba vacío, limpiamos el origen
                ops.push(supabase.from("relevos").delete()
                    .eq("evento_id", params.id)
                    .eq("trabajadera", selectedPos.t)
                    .eq("posicion", selectedPos.p)
                    .eq("muda_id", activeMudaId));
            }

            await Promise.all(ops);
            setSelectedPos(null);
            await fetchRelevos();
            setLoading(false);
            return;
        }

        // Caso 2: Nadie seleccionado.
        // Solo seleccionamos la posición. El modal se abre desde el botón de la barra flotante.
        setSelectedPos({ t, p });
    };

    const assignCostalero = async (cid: string | null) => {
        if (!selectedPos || !activeMudaId) return;
        setLoading(true);

        const supplementVal = assignmentSupplement ? parseFloat(assignmentSupplement) : null;

        if (cid) {
            // Si el costalero ya estaba en otra posición EN EL MISMO RELEVO, limpiar esa posición primero
            await supabase.from("relevos").delete()
                .eq("evento_id", params.id)
                .eq("costalero_id", cid)
                .eq("muda_id", activeMudaId);

            await supabase.from("relevos").upsert({
                evento_id: params.id,
                trabajadera: selectedPos.t,
                posicion: selectedPos.p,
                costalero_id: cid,
                muda_id: activeMudaId,
                suplemento: supplementVal
            }, { onConflict: "evento_id,trabajadera,posicion,muda_id" });
        } else {
            await supabase.from("relevos").delete()
                .eq("evento_id", params.id)
                .eq("trabajadera", selectedPos.t)
                .eq("posicion", selectedPos.p)
                .eq("muda_id", activeMudaId);
        }

        setShowModal(false);
        setSelectedPos(null);
        setSearchTerm("");
        setAssignmentSupplement("");
        await fetchRelevos();
        setLoading(false);
    };

    const handleManageMuda = async () => {
        if (!mudaNameInput.trim()) return;
        setLoading(true);

        try {
            if (editingMuda) {
                // Renombrar
                const { error } = await supabase.from("muda_nombres")
                    .update({ nombre: mudaNameInput })
                    .eq("id", editingMuda.id);
                if (error) throw error;
            } else {
                // Crear
                const { error } = await supabase.from("muda_nombres").insert({
                    evento_id: params.id,
                    nombre: mudaNameInput,
                    orden: mudas.length + 1
                });
                if (error) throw error;
            }

            setShowMudaModal(false);
            setMudaNameInput("");
            setEditingMuda(null);
            await fetchInitialData();
        } catch (error: any) {
            console.error("Error managing muda:", error);
            alert("Error al guardar el relevo: " + (error.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    const deleteMuda = async () => {
        if (!editingMuda) return;
        if (!confirm("¿Seguro que quieres borrar este relevo? Se perderá toda su formación.")) return;

        setLoading(true);
        try {
            const { error } = await supabase.from("muda_nombres").delete().eq("id", editingMuda.id);
            if (error) throw error;

            setShowMudaModal(false);
            setEditingMuda(null);
            setMudaNameInput("");
            await fetchInitialData();
        } catch (error: any) {
            console.error("Error deleting muda:", error);
            alert("Error al borrar el relevo: " + (error.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    const occupadas = relevos.filter(r => r.costalero_id).length;
    const pct = (occupadas / totalHuecos) * 100;

    const filteredCandidates = cuadrilla
        .filter(c => {
            // Mostrar todos los costaleros (ya no filtramos por presente)
            const isAssigned = relevos.some(r => r.costalero_id === c.id);
            if (isAssigned) return false;

            // Si searchOther es false, filtramos por trabajadera
            if (!searchOther && Number(c.trabajadera) !== Number(selectedPos?.t)) {
                return false;
            }

            if (searchTerm) {
                const fullName = `${c.nombre} ${c.apellidos}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
            }
            return true;
        })
        // Ordenar por trabajadera y luego por apellidos
        .sort((a, b) => {
            // Primero ordenar por trabajadera
            if (a.trabajadera !== b.trabajadera) {
                return a.trabajadera - b.trabajadera;
            }
            // Luego por apellidos
            return a.apellidos.localeCompare(b.apellidos);
        });

    // Función para obtener el color del borde según estado de asistencia
    const getAsistenciaBorderColor = (estado: string) => {
        switch (estado) {
            case 'presente': return 'border-l-4 border-l-emerald-500';
            case 'ausente': return 'border-l-4 border-l-red-500';
            case 'justificado': return 'border-l-4 border-l-amber-500';
            default: return 'border-l-4 border-l-neutral-300';
        }
    };

    const getAsistenciaLabel = (estado: string) => {
        switch (estado) {
            case 'presente': return { text: 'PRESENTE', color: 'bg-emerald-100 text-emerald-700' };
            case 'ausente': return { text: 'AUSENTE', color: 'bg-red-100 text-red-700' };
            case 'justificado': return { text: 'JUSTIFICADO', color: 'bg-amber-100 text-amber-700' };
            default: return { text: 'PENDIENTE', color: 'bg-neutral-100 text-neutral-500' };
        }
    };

    if (loading && relevos.length === 0) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    const huecosLabels = ["Patero Izq", "Patero Der", "Fijador Izq", "Fijador Der", "Corriente"];

    return (
        <div className="min-h-screen pb-32 bg-background animate-in fade-in duration-700">
            {/* Top Bar */}
            <div className="p-6 pb-0 space-y-6">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-900 hover:text-black transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Gestión de Relevos</h1>
                    </div>
                </header>

                {/* Relevo Selector (Dynamic Tabs) */}
                <div className="flex gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-black/5 overflow-x-auto no-scrollbar items-center">
                    {mudas.map((muda) => (
                        <button
                            key={muda.id}
                            onClick={() => setActiveMudaId(muda.id)}
                            onDoubleClick={() => {
                                setEditingMuda(muda);
                                setMudaNameInput(muda.nombre);
                                setShowMudaModal(true);
                            }}
                            className={cn(
                                "flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2",
                                activeMudaId === muda.id
                                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5 translate-y-[-1px]"
                                    : "bg-neutral-200/50 text-neutral-900 hover:bg-neutral-200"
                            )}
                        >
                            {muda.nombre}
                            {activeMudaId === muda.id && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingMuda(muda);
                                        setMudaNameInput(muda.nombre);
                                        setShowMudaModal(true);
                                    }}
                                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-900 transition-colors"
                                >
                                    <Settings2 size={12} />
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-neutral-900 tracking-tighter italic">{occupadas}/{totalHuecos} Huecos</h3>
                            <p className="text-[10px] text-neutral-900 font-black uppercase tracking-[0.2em]">{mudas.find(m => m.id === activeMudaId)?.nombre || 'RELEVO'}</p>
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
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter italic">TRABAJADERA {t}</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((p) => {
                                const costalero = getCostaleroAt(t, p);
                                const isSelected = selectedPos?.t === t && selectedPos?.p === p;
                                // Comprobación flexible: "Patero Izq" incluye "Patero"
                                const isOutOfPosition = costalero && !huecosLabels[p - 1].toLowerCase().includes(costalero.puesto.toLowerCase());
                                const isOutOfTrabajadera = costalero && Number(costalero.trabajadera) !== Number(t);
                                const isOutOfPlace = isOutOfPosition || isOutOfTrabajadera;
                                const releveData = relevos.find(r => r.trabajadera === t && r.posicion === p);

                                // Colores basados en asistencia
                                const getAsistenciaBg = () => {
                                    if (!costalero) return 'bg-neutral-50/50 border-dashed border-neutral-200';
                                    if (isSelected) return 'border-primary bg-primary/5 shadow-lg scale-105 z-10';
                                    switch (costalero.estadoAsistencia) {
                                        case 'presente': return 'bg-emerald-50 border-emerald-300 shadow-sm';
                                        case 'ausente': return 'bg-red-50 border-red-300 shadow-sm';
                                        case 'justificado': return 'bg-amber-50 border-amber-300 shadow-sm';
                                        default: return 'bg-white border-neutral-100 shadow-sm';
                                    }
                                };

                                return (
                                    <button
                                        key={`${t}-${p}`}
                                        onClick={() => handlePosClick(t, p)}
                                        className={cn(
                                            "relative p-3 rounded-[20px] border-2 transition-all flex flex-col justify-between h-24 text-left",
                                            getAsistenciaBg(),
                                            isOutOfPlace && costalero && 'animate-[float_2s_ease-in-out_infinite]'
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-900">{huecosLabels[p - 1]}</span>
                                            <div className="flex flex-col items-end gap-1">
                                                {costalero && (
                                                    <span className="text-[7px] font-black bg-neutral-900/5 text-neutral-900 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                        {costalero.puesto}
                                                    </span>
                                                )}
                                                {(releveData?.suplemento != null || (!isOutOfTrabajadera && costalero?.suplemento != null)) && (
                                                    <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                                        +{releveData?.suplemento ?? costalero?.suplemento}cm
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "font-black text-[13px] leading-tight line-clamp-2",
                                            costalero ? "text-neutral-900" : "text-neutral-300 font-medium"
                                        )}>
                                            {costalero ? `${costalero.nombre} ${costalero.apellidos}` : 'Asignar...'}
                                        </span>
                                        {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />}
                                        {isOutOfPlace && costalero && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-[8px] text-white font-black">!</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}

                            {/* Corriente (Position 5) */}
                            <div className="col-span-2 flex justify-center pt-2">
                                {(() => {
                                    const costaleroCorriente = getCostaleroAt(t, 5);
                                    const isCorrienteOutOfPosition = costaleroCorriente && costaleroCorriente.puesto !== "Corriente";
                                    const isCorrienteOutOfTrabajadera = costaleroCorriente && Number(costaleroCorriente.trabajadera) !== Number(t);
                                    const isCorrienteOutOfPlace = isCorrienteOutOfPosition || isCorrienteOutOfTrabajadera;
                                    const releveData = relevos.find(r => r.trabajadera === t && r.posicion === 5);

                                    // Colores basados en asistencia para Corriente
                                    const getCorrienteAsistenciaBg = () => {
                                        if (!costaleroCorriente) return 'bg-neutral-50/50 border-dashed border-neutral-200';
                                        if (selectedPos?.t === t && selectedPos?.p === 5) return 'border-primary bg-primary/5 shadow-lg scale-105 z-10';
                                        switch (costaleroCorriente.estadoAsistencia) {
                                            case 'presente': return 'bg-emerald-50 border-emerald-300 shadow-sm';
                                            case 'ausente': return 'bg-red-50 border-red-300 shadow-sm';
                                            case 'justificado': return 'bg-amber-50 border-amber-300 shadow-sm';
                                            default: return 'bg-white border-neutral-100 shadow-sm';
                                        }
                                    };

                                    return (
                                        <button
                                            onClick={() => handlePosClick(t, 5)}
                                            className={cn(
                                                "w-full max-w-[240px] p-3 rounded-[20px] border-2 transition-all flex flex-col justify-between h-24 text-center relative",
                                                getCorrienteAsistenciaBg(),
                                                isCorrienteOutOfPlace && costaleroCorriente && 'animate-[float_2s_ease-in-out_infinite]'
                                            )}
                                        >
                                            <div className="flex justify-center items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-900">CORRIENTE</span>
                                                <div className="flex flex-col items-start gap-1">
                                                    {costaleroCorriente && (
                                                        <span className="text-[7px] font-black bg-neutral-900/5 text-neutral-900 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                            {costaleroCorriente.puesto}
                                                        </span>
                                                    )}
                                                    {(releveData?.suplemento != null || (!isCorrienteOutOfTrabajadera && costaleroCorriente?.suplemento != null)) && (
                                                        <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                                            +{releveData?.suplemento ?? costaleroCorriente?.suplemento}cm
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "font-black text-[13px] leading-tight min-h-[1.2em]",
                                                costaleroCorriente ? "text-neutral-900" : "text-neutral-300 font-medium"
                                            )}>
                                                {costaleroCorriente ? `${costaleroCorriente.nombre} ${costaleroCorriente.apellidos}` : 'Sin asignar'}
                                            </span>
                                            {isCorrienteOutOfPlace && costaleroCorriente && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <span className="text-[8px] text-white font-black">!</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })()}
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
                            <p className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Trabajadera {selectedPos?.t} • {huecosLabels[(selectedPos?.p || 1) - 1]}</p>
                        </div>

                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-900" size={16} />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    className="pl-10 h-12 bg-neutral-50 border-none rounded-2xl"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[9px] font-black text-neutral-900 uppercase tracking-widest ml-1">Suplemento (cm)</label>
                                    <Input
                                        type="number"
                                        placeholder="Ej: 2.5"
                                        className="h-12 bg-neutral-50 border-none rounded-2xl font-bold"
                                        value={assignmentSupplement}
                                        onChange={e => setAssignmentSupplement(e.target.value)}
                                    />
                                </div>
                                <div className="flex-[2] flex flex-col justify-end">
                                    <button
                                        onClick={() => setSearchOther(!searchOther)}
                                        className={cn(
                                            "flex items-center justify-between p-3.5 h-12 rounded-2xl border transition-all",
                                            searchOther ? "bg-primary/5 border-primary text-primary" : "bg-white border-black/5 text-neutral-900"
                                        )}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">Otras trabajaderas</span>
                                        {searchOther ? <Check size={14} /> : <div className="w-4 h-4 border-2 border-neutral-900 rounded" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredCandidates.length === 0 ? (
                                    <div className="text-center py-10 opacity-40 italic text-sm">No hay costaleros libres</div>
                                ) : (
                                    filteredCandidates.map(c => {
                                        const label = getAsistenciaLabel(c.estadoAsistencia);
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => assignCostalero(c.id)}
                                                className={cn(
                                                    "w-full p-4 bg-neutral-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-primary/20 rounded-2xl flex items-center justify-between group transition-all",
                                                    getAsistenciaBorderColor(c.estadoAsistencia)
                                                )}
                                            >
                                                <div className="text-left">
                                                    <p className="font-extrabold text-neutral-900 group-hover:text-primary">{c.nombre} {c.apellidos}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest">T-{c.trabajadera} • {c.puesto}</p>
                                                        <span className={cn("text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase", label.color)}>
                                                            {label.text}
                                                        </span>
                                                    </div>
                                                </div>
                                                <UserPlus size={18} className="text-neutral-900 group-hover:text-primary" />
                                            </button>
                                        );
                                    })
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

            {/* Modal de Gestión de Muda (Nombre/Borrar) */}
            {showMudaModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setShowMudaModal(false)}>
                    <div className="w-full max-w-sm bg-white rounded-[32px] p-8 space-y-6 shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight italic">
                                {editingMuda ? 'Editar Relevo' : 'Nuevo Relevo'}
                            </h3>
                            <p className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Ponle un nombre para identificarlo</p>
                        </div>

                        <div className="space-y-4">
                            <Input
                                placeholder="Nombre (ej: Salida, Carrera Oficial...)"
                                className="h-14 bg-neutral-50 border-none rounded-2xl text-center font-bold text-neutral-900"
                                value={mudaNameInput}
                                onChange={(e) => setMudaNameInput(e.target.value)}
                                autoFocus
                            />
                            <Button className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest" onClick={handleManageMuda}>
                                Guardar Cambios
                            </Button>

                            {editingMuda && (
                                <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest" onClick={deleteMuda}>
                                    Borrar este Relevo
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Float Help */}
            {selectedPos && !showModal && !showMudaModal && (
                <div className="fixed bottom-6 right-6 z-40 w-full max-w-[340px]">
                    <div className="bg-neutral-900 border border-white/10 p-5 rounded-[28px] shadow-2xl flex flex-col gap-4 text-white animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-xl">
                                    <ArrowLeftRight size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black uppercase tracking-tight truncate">{getCostaleroAt(selectedPos.t, selectedPos.p)?.nombre || 'Hueco'}</p>
                                    <p className="text-[8px] text-neutral-400 font-bold leading-tight">Toca otro hueco para intercambio</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPos(null)} className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors px-2">
                                ×
                            </button>
                        </div>

                        <Button
                            className="bg-white text-black hover:bg-neutral-200 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl w-full"
                            onClick={() => setShowModal(true)}
                        >
                            {getCostaleroAt(selectedPos.t, selectedPos.p) ? 'Cambiar por otro' : 'Asignar Costalero'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Floating Action Button for New Muda */}
            <button
                onClick={() => {
                    setEditingMuda(null);
                    setMudaNameInput("");
                    setShowMudaModal(true);
                }}
                className="fixed bottom-24 right-6 z-40 p-5 bg-primary text-white rounded-full shadow-[0_8px_30px_rgba(128,0,32,0.4)] hover:scale-110 active:scale-95 transition-all animate-in zoom-in slide-in-from-bottom-10 duration-500"
            >
                <Plus size={28} />
            </button>
        </div>
    );
}
