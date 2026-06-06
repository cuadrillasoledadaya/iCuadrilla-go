'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Activity,
  CheckCircle2,
  Timer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { useEventos, type Evento } from '@/hooks/useEventos';
import { Spinner } from '@/components/ui/spinner';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Sort eventos: finalized at the bottom, rest by fecha_inicio ascending.
 * Pure function — does not mutate the input array.
 */
function sortEventos(evts: Evento[]): Evento[] {
  return [...evts].sort((a, b) => {
    const isFinishedA = a.estado === 'finalizado' ? 1 : 0;
    const isFinishedB = b.estado === 'finalizado' ? 1 : 0;
    if (isFinishedA !== isFinishedB) return isFinishedA - isFinishedB;
    return new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime();
  });
}

/**
 * Recalculate event status based on current time vs start/end dates.
 * Pure function — no side effects.
 */
function calculateStatus(
  inicio: string,
  fin: string | null
): 'pendiente' | 'en-curso' | 'finalizado' {
  const now = new Date();
  const start = new Date(inicio);
  const end = fin ? new Date(fin) : new Date(start.getTime() + 3 * 60 * 60 * 1000);

  if (now < start) return 'pendiente';
  if (now >= start && now <= end) return 'en-curso';
  return 'finalizado';
}

export default function AgendaEventos() {
  const router = useRouter();
  const { canManageEvents } = useUserRole();
  const { eventos: rawEventos, loading, activeSeasonName } = useEventos();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Local state for sorted + status-adjusted events.
  // Raw events from the hook are sorted here; the status sync interval
  // (below) updates this state in-place with live status recalculations.
  const [eventos, setEventos] = useState<Evento[]>([]);

  // Ref to keep the interval closure fresh
  const eventosRef = useRef(eventos);
  useEffect(() => {
    eventosRef.current = eventos;
  }, [eventos]);

  // Sync raw hook data → sorted local state on initial load / refetch
  useEffect(() => {
    if (rawEventos) {
      setEventos(sortEventos(rawEventos));
    }
  }, [rawEventos]);

  const filtered = eventos.filter(
    (e) =>
      e.titulo.toLowerCase().includes(search.toLowerCase()) ||
      e.ubicacion.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (estado: string): BadgeVariant => {
    switch (estado) {
      case 'en-curso':
        return 'en-curso';
      case 'finalizado':
        return 'finalizado';
      default:
        return 'pendiente';
    }
  };

  const getCardStyle = (estado: string) => {
    switch (estado) {
      case 'en-curso':
        return 'bg-emerald-100/60 border-emerald-200 shadow-emerald-100/20';
      case 'finalizado':
        return 'bg-red-100/60 border-red-200 shadow-red-100/20';
      default:
        return 'bg-orange-100/60 border-orange-200 shadow-orange-100/20';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'en-curso':
        return <Activity size={10} className="animate-pulse" />;
      case 'finalizado':
        return <CheckCircle2 size={10} />;
      default:
        return <Timer size={10} />;
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'en-curso':
        return 'EN CURSO';
      case 'finalizado':
        return 'FINALIZADO';
      default:
        return 'PENDIENTE';
    }
  };

  // Status sync interval: recalculates live statuses every 60s,
  // updates Supabase for persistence, and re-sorts in local state.
  useEffect(() => {
    if (eventos.length === 0) return;

    const syncStatuses = async () => {
      const current = eventosRef.current;
      const updates = current.map(async (e) => {
        const realStatus = calculateStatus(e.fecha_inicio, e.fecha_fin);
        if (realStatus !== e.estado) {
          await supabase.from('eventos').update({ estado: realStatus }).eq('id', e.id);
          return { ...e, estado: realStatus };
        }
        return e;
      });

      const updatedEventos = await Promise.all(updates);
      const sorted = sortEventos(updatedEventos);

      if (JSON.stringify(sorted) !== JSON.stringify(eventosRef.current)) {
        setEventos(sorted);
      }
    };

    syncStatuses();
    const interval = setInterval(syncStatuses, 60000);
    return () => clearInterval(interval);
  }, [eventos.length]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
      <PageHeader
        title="Agenda de Eventos"
        subtitle={`Temporada ${activeSeasonName || '...'}`}
        back
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <Input
          placeholder="Buscar evento o lugar..."
          className="bg-white pl-12 h-14 border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400 focus:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <EmptyState icon={Calendar} title="No hay eventos programados" />
        ) : (
          filtered.map((e) => (
            <div
              key={e.id}
              onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
              className={cn(
                'p-6 rounded-[32px] flex flex-col space-y-4 group cursor-pointer active:scale-[0.98] transition-all border shadow-sm',
                getCardStyle(e.estado)
              )}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-neutral-900 group-hover:text-primary transition-colors uppercase tracking-tight">
                  {e.titulo}
                </h3>
                <Badge variant={getStatusStyle(e.estado)} size="sm">
                  {getStatusIcon(e.estado)}
                  {getStatusLabel(e.estado)}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-600 font-bold">
                    <div className="p-1.5 rounded-lg bg-white/50 text-neutral-700">
                      <Calendar size={14} />
                    </div>
                    <span className="text-xs">
                      {new Date(e.fecha_inicio).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-neutral-300 mx-1">•</span>
                    <div className="p-1.5 rounded-lg bg-white/50 text-neutral-700">
                      <Clock size={14} />
                    </div>
                    <span className="text-xs">
                      {new Date(e.fecha_inicio).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {e.fecha_fin &&
                        ` - ${new Date(e.fecha_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-500 font-medium italic">
                    <div className="p-1.5 rounded-lg bg-white/50 text-neutral-400">
                      <MapPin size={14} />
                    </div>
                    <span className="text-xs truncate">{e.ubicacion}</span>
                  </div>
                </div>

                <div
                  className={cn(
                    'overflow-hidden transition-all duration-500 ease-in-out',
                    expandedId === e.id
                      ? 'max-h-[500px] opacity-100 pt-2'
                      : 'max-h-0 opacity-0 pt-0'
                  )}
                >
                  <div className="p-4 bg-white/40 rounded-2xl border border-black/5 space-y-2">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Activity size={12} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Observaciones
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {e.descripcion || 'Sin observaciones adicionales.'}
                    </p>
                    <button
                      onClick={(ee) => {
                        ee.stopPropagation();
                        router.push(`/eventos/${e.id}`);
                      }}
                      className="w-full mt-4 h-12 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-transform"
                    >
                      Entrar al Evento
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-black/5">
                  <div className="flex items-center gap-2 group/btn">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest italic group-hover/btn:text-primary transition-colors">
                      {expandedId === e.id ? 'Cerrar Detalles' : 'Ver Detalles'}
                    </span>
                    <ChevronRight
                      className={cn(
                        'text-neutral-400 group-hover/btn:text-primary transition-all duration-300',
                        expandedId === e.id && 'rotate-90'
                      )}
                      size={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {canManageEvents && (
        <button
          onClick={() => router.push('/eventos/nuevo')}
          aria-label="Nuevo Evento"
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform z-40"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
