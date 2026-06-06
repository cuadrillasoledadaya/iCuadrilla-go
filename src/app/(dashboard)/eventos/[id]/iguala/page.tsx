'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Search, UserPlus, Trash2, ArrowLeftRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { cn, getDisplayName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

interface Costalero {
  id: string;
  nombre: string;
  apellidos: string;
  apodo?: string;
  trabajadera: number;
  puesto: string;
  puesto_secundario?: string;
  estadoAsistencia: 'presente' | 'ausente' | 'justificado' | 'pendiente';
  suplemento?: number;
}

interface Iguala {
  id: string;
  trabajadera: number;
  posicion: number;
  costalero_id: string | null;
  muda_id: string;
  suplemento?: number;
  posicion_label?: string | null;
  costalero?: Costalero;
}

const TRABAJADERAS_COUNT = 7;

const POSICIONES_PATERAS = [
  'Patero Izq',
  'Patero Der',
  'Costero Izq',
  'Costero Der',
  'Fijador Izq',
  'Fijador Der',
  'Corriente',
];

const POSICIONES_CENTRO = [
  'Costero Izq',
  'Costero Der',
  'Fijador Izq',
  'Fijador Der',
  'Corriente',
];

function getAvailablePositions(t: number): string[] {
  return t === 1 || t === TRABAJADERAS_COUNT ? POSICIONES_PATERAS : POSICIONES_CENTRO;
}

type UpsertIgualaResult = { error: unknown; migrationPending: boolean };

async function safeUpsertIguala(
  payload: Record<string, unknown>
): Promise<UpsertIgualaResult> {
  const result = await supabase
    .from('relevos')
    .upsert(payload, { onConflict: 'evento_id,trabajadera,posicion,muda_id' });

  if (result.error && /posicion_label/i.test(result.error.message)) {
    const { posicion_label: _omit, ...rest } = payload;
    const fallback = await supabase
      .from('relevos')
      .upsert(rest, { onConflict: 'evento_id,trabajadera,posicion,muda_id' });
    return { error: fallback.error, migrationPending: true };
  }

  return { error: result.error, migrationPending: false };
}

const CandidateItem = memo(function CandidateItem({
  costalero,
  onAssign,
}: {
  costalero: Costalero;
  onAssign: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onAssign(costalero.id)}
      className={cn(
        'w-full p-4 bg-neutral-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-primary/20 rounded-2xl flex items-center justify-between group transition-all',
        getAsistenciaBorderColor(costalero.estadoAsistencia)
      )}
    >
      <div className="text-left">
        <p className="font-extrabold text-neutral-900 group-hover:text-primary">
          {getDisplayName(costalero)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest">
            T-{costalero.trabajadera} • {costalero.puesto}
          </p>
          <Badge variant={getAsistenciaVariant(costalero.estadoAsistencia)} size="sm">
            {getAsistenciaLabel(costalero.estadoAsistencia)}
          </Badge>
        </div>
      </div>
      <UserPlus size={18} className="text-neutral-900 group-hover:text-primary" />
    </button>
  );
});

function getAsistenciaBorderColor(estado: string) {
  switch (estado) {
    case 'presente':
      return 'border-l-4 border-l-emerald-500';
    case 'ausente':
      return 'border-l-4 border-l-red-500';
    case 'justificado':
      return 'border-l-4 border-l-amber-500';
    default:
      return 'border-l-4 border-l-neutral-300';
  }
}

const getAsistenciaVariant = (estado: string) => {
  switch (estado) {
    case 'presente':
      return 'presente' as const;
    case 'ausente':
      return 'ausente' as const;
    case 'justificado':
      return 'justificado' as const;
    default:
      return 'neutral' as const;
  }
};

const getAsistenciaLabel = (estado: string) => {
  switch (estado) {
    case 'presente':
      return 'PRESENTE';
    case 'ausente':
      return 'AUSENTE';
    case 'justificado':
      return 'JUSTIFICADO';
    default:
      return 'PENDIENTE';
  }
};

export default function GestionIguala() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [igualas, setIgualas] = useState<Iguala[]>([]);
  const [cuadrilla, setCuadrilla] = useState<Costalero[]>([]);
  const [loading, setLoading] = useState(true);
  const [mudaId, setMudaId] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ t: number; p: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentSupplement, setAssignmentSupplement] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [params.id]);

  useEffect(() => {
    if (mudaId) {
      fetchIgualas();
    }
  }, [mudaId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      let { data: mudaData } = await supabase
        .from('muda_nombres')
        .select('*')
        .eq('evento_id', params.id)
        .eq('nombre', 'Iguala')
        .maybeSingle();

      if (!mudaData) {
        const { data: anyMuda } = await supabase
          .from('muda_nombres')
          .select('*')
          .eq('evento_id', params.id)
          .order('orden', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (anyMuda) {
          mudaData = anyMuda;
        } else {
          const { data: newMuda } = await supabase
            .from('muda_nombres')
            .insert({
              evento_id: params.id,
              nombre: 'Iguala',
              orden: 1,
            })
            .select()
            .single();
          mudaData = newMuda;
        }
      }

      if (mudaData) {
        setMudaId(mudaData.id);
      }

      const [costalerosRes, asistenciasRes] = await Promise.all([
        supabase.from('costaleros').select('*').eq('rol', 'costalero'),
        supabase.from('asistencias').select('costalero_id, estado').eq('evento_id', params.id),
      ]);

      const asistenciaMap = new Map<string, string>();
      asistenciasRes.data?.forEach((a) => {
        asistenciaMap.set(a.costalero_id, a.estado);
      });

      const formattedCuadrilla = (costalerosRes.data || []).map((c) => {
        const estado = asistenciaMap.get(c.id);
        return {
          ...c,
          estadoAsistencia:
            estado === 'presente'
              ? 'presente'
              : estado === 'ausente'
                ? 'ausente'
                : estado === 'justificado' || estado === 'justificada'
                  ? 'justificado'
                  : ('pendiente' as const),
        };
      });
      setCuadrilla(formattedCuadrilla);
    } catch (e) {
      console.error(e);
      toast.error('Error al cargar los datos de la cuadrilla');
    } finally {
      setLoading(false);
    }
  };

  const fetchIgualas = async () => {
    if (!mudaId) return;
    const { data } = await supabase
      .from('relevos')
      .select('*, costalero:costaleros(*)')
      .eq('evento_id', params.id)
      .eq('muda_id', mudaId);
    setIgualas(data || []);
  };

  const positionsByTrabajadera = useMemo(() => {
    return Array.from({ length: TRABAJADERAS_COUNT }, (_, i) => i + 1).map((t) => {
      const count = cuadrilla.filter((c) => Number(c.trabajadera) === Number(t)).length;
      return { t, count };
    });
  }, [cuadrilla]);

  const totalHuecos = useMemo(
    () => positionsByTrabajadera.reduce((sum, { count }) => sum + count, 0),
    [positionsByTrabajadera]
  );

  const getCostaleroAt = (t: number, p: number) => {
    const iguala = igualas.find((r) => r.trabajadera === t && r.posicion === p);
    if (!iguala?.costalero) return null;
    const cuadrillaData = cuadrilla.find((c) => c.id === iguala.costalero_id);
    return {
      ...iguala.costalero,
      estadoAsistencia: cuadrillaData?.estadoAsistencia || 'pendiente',
    };
  };

  const handlePosClick = async (t: number, p: number) => {
    const costalero = getCostaleroAt(t, p);

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

      const targetCostalero = getCostaleroAt(t, p);
      const ops = [];

      ops.push(
        supabase.from('relevos').upsert(
          {
            evento_id: params.id,
            trabajadera: t,
            posicion: p,
            costalero_id: sourceCostalero.id,
            muda_id: mudaId,
          },
          { onConflict: 'evento_id,trabajadera,posicion,muda_id' }
        )
      );

      if (targetCostalero) {
        ops.push(
          supabase.from('relevos').upsert(
            {
              evento_id: params.id,
              trabajadera: selectedPos.t,
              posicion: selectedPos.p,
              costalero_id: targetCostalero.id,
              muda_id: mudaId,
            },
            { onConflict: 'evento_id,trabajadera,posicion,muda_id' }
          )
        );
      } else {
        ops.push(
          supabase
            .from('relevos')
            .delete()
            .eq('evento_id', params.id)
            .eq('trabajadera', selectedPos.t)
            .eq('posicion', selectedPos.p)
            .eq('muda_id', mudaId!)
        );
      }

      await Promise.all(ops);
      setSelectedPos(null);
      await fetchIgualas();
      setLoading(false);
      return;
    }

    const existing = igualas.find((r) => r.trabajadera === t && r.posicion === p);
    setSelectedPos({ t, p });
    setSelectedPosition(existing?.posicion_label ?? null);
  };

  const assignCostalero = async (cid: string | null) => {
    if (!selectedPos || !mudaId) return;
    setLoading(true);

    const supplementVal = assignmentSupplement ? parseFloat(assignmentSupplement) : null;

    if (cid) {
      await supabase
        .from('relevos')
        .delete()
        .eq('evento_id', params.id)
        .eq('costalero_id', cid)
        .eq('muda_id', mudaId);

      const { error, migrationPending } = await safeUpsertIguala({
        evento_id: params.id,
        trabajadera: selectedPos.t,
        posicion: selectedPos.p,
        costalero_id: cid,
        muda_id: mudaId,
        suplemento: supplementVal,
        posicion_label: selectedPosition,
      });

      if (error) {
        toast.error('Error al asignar el costalero');
        setLoading(false);
        return;
      }

      if (migrationPending) {
        toast.warning(
          'Migración pendiente: aplicá el SQL para guardar la posición del costalero.'
        );
      }
    } else {
      const { error } = await supabase
        .from('relevos')
        .delete()
        .eq('evento_id', params.id)
        .eq('trabajadera', selectedPos.t)
        .eq('posicion', selectedPos.p)
        .eq('muda_id', mudaId);

      if (error) {
        toast.error('Error al vaciar el hueco');
        setLoading(false);
        return;
      }
    }

    setShowModal(false);
    setSelectedPos(null);
    setSearchTerm('');
    setAssignmentSupplement('');
    setSelectedPosition(null);
    await fetchIgualas();
    setLoading(false);
  };

  const occupadas = igualas.filter((r) => r.costalero_id).length;
  const pct = totalHuecos > 0 ? (occupadas / totalHuecos) * 100 : 0;

  const filteredCandidates = cuadrilla
    .filter((c) => {
      const isAssigned = igualas.some((r) => r.costalero_id === c.id);
      if (isAssigned) return false;
      if (Number(c.trabajadera) !== Number(selectedPos?.t)) {
        return false;
      }
      if (searchTerm) {
        const fullName = `${c.nombre} ${c.apellidos} ${c.apodo || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => a.apellidos.localeCompare(b.apellidos));

  if (loading && igualas.length === 0)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="min-h-screen pb-32 bg-background animate-in fade-in duration-700">
      <div className="p-6 pb-0 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-900 hover:text-black transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
              Gestión de Iguala
            </h1>
          </div>
        </header>

        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-neutral-900 tracking-tighter italic">
                {occupadas}/{totalHuecos} Huecos
              </h3>
              <p className="text-[10px] text-neutral-900 font-black uppercase tracking-[0.2em]">
                IGUALA
              </p>
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

      <div className="p-6 space-y-8 mt-4">
        {positionsByTrabajadera.map(({ t, count }) => {
          if (count === 0) return null;

          return (
            <div key={t} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tighter italic">
                  TRABAJADERA {t} <span className="text-neutral-400 text-sm">({count})</span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
              </div>

              <div className="flex flex-row gap-2 overflow-x-auto pb-2">
                {Array.from({ length: count }, (_, i) => i + 1).map((p) => {
                  const costalero = getCostaleroAt(t, p);
                  const isSelected = selectedPos?.t === t && selectedPos?.p === p;
                  const releveData = igualas.find((r) => r.trabajadera === t && r.posicion === p);

                  const getAsistenciaBg = () => {
                    if (!costalero) return 'bg-neutral-50/50 border-dashed border-neutral-200';
                    if (isSelected) return 'border-primary bg-primary/5 shadow-lg scale-105 z-10';
                    switch (costalero.estadoAsistencia) {
                      case 'presente':
                        return 'bg-emerald-50 border-emerald-300 shadow-sm';
                      case 'ausente':
                        return 'bg-red-50 border-red-300 shadow-sm';
                      case 'justificado':
                        return 'bg-amber-50 border-amber-300 shadow-sm';
                      default:
                        return 'bg-white border-neutral-100 shadow-sm';
                    }
                  };

                  return (
                    <button
                      key={`${t}-${p}`}
                      onClick={() => handlePosClick(t, p)}
                      className={cn(
                        'relative flex-1 min-w-[70px] p-2 rounded-2xl border-2 transition-all flex flex-col justify-between h-20 text-left',
                        getAsistenciaBg()
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-900">
                          {releveData?.posicion_label || `Pos. ${p}`}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          {costalero && (
                            <span className="text-[7px] font-black bg-neutral-900/5 text-neutral-900 px-1 py-0.5 rounded-full uppercase tracking-tighter">
                              {costalero.puesto}
                            </span>
                          )}
                          {(releveData?.suplemento != null || costalero?.suplemento != null) && (
                            <span className="text-[8px] font-black bg-primary/10 text-primary px-1 py-0.5 rounded-full">
                              +{releveData?.suplemento ?? costalero?.suplemento}cm
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'font-black text-[10px] leading-tight line-clamp-2',
                          costalero ? 'text-neutral-900' : 'text-neutral-300 font-medium'
                        )}
                      >
                        {costalero ? getDisplayName(costalero) : 'Asignar...'}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setShowModal(false);
            setSelectedPos(null);
            setSelectedPosition(null);
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-[40px] p-8 pb-32 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-1 w-12 bg-neutral-100 rounded-full mx-auto mb-4" />
              <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight italic">
                {selectedPos && getCostaleroAt(selectedPos.t, selectedPos.p)
                  ? 'Cambiar Costalero'
                  : 'Asignar Costalero'}
              </h3>
              <p className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">
                Trabajadera {selectedPos?.t} •{' '}
                {selectedPosition || `Pos. ${selectedPos?.p}`}
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-900"
                  size={16}
                />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-10 h-12 bg-neutral-50 border-none rounded-2xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {selectedPos && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-900 uppercase tracking-widest ml-1">
                    Posición
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPosition(null)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
                        selectedPosition === null
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                      )}
                    >
                      Ninguna
                    </button>
                    {getAvailablePositions(selectedPos.t).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setSelectedPosition(pos)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
                          selectedPosition === pos
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                        )}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-neutral-900 uppercase tracking-widest ml-1">
                  Suplemento (cm)
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 2.5"
                  className="h-12 bg-neutral-50 border-none rounded-2xl font-bold"
                  value={assignmentSupplement}
                  onChange={(e) => setAssignmentSupplement(e.target.value)}
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-10 opacity-40 italic text-sm">
                    No hay costaleros libres en esta trabajadera
                  </div>
                ) : (
                  filteredCandidates.map((c) => (
                    <CandidateItem key={c.id} costalero={c} onAssign={assignCostalero} />
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

      {selectedPos && !showModal && (
        <div className="fixed bottom-6 right-6 z-40 w-full max-w-[340px]">
          <div className="bg-neutral-900 border border-white/10 p-5 rounded-[28px] shadow-2xl flex flex-col gap-4 text-white animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <ArrowLeftRight size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight truncate">
                    {getCostaleroAt(selectedPos.t, selectedPos.p)
                      ? getDisplayName(getCostaleroAt(selectedPos.t, selectedPos.p)!)
                      : 'Hueco'}
                  </p>
                  <p className="text-[8px] text-neutral-400 font-bold leading-tight">
                    Toca otro hueco para intercambio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPos(null)}
                className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors px-2"
              >
                ×
              </button>
            </div>

            <Button
              className="bg-white text-black hover:bg-neutral-200 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl w-full"
              onClick={() => setShowModal(true)}
            >
              {getCostaleroAt(selectedPos.t, selectedPos.p)
                ? 'Cambiar por otro'
                : 'Asignar Costalero'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
