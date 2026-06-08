'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Search, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { cn, getDisplayName } from '@/lib/utils';

interface Costalero {
  id: string;
  nombre: string;
  apellidos: string;
  apodo?: string;
  trabajadera: number;
  puesto: string;
}

interface Asistencia {
  evento_id: string;
  costalero_id: string;
  estado: 'presente' | 'ausente' | 'justificado' | 'justificada';
}

interface EventoTemporada {
  id: string;
  titulo: string;
  fecha_inicio: string;
}

interface ScoreEntry {
  costalero: Costalero;
  eventScore: number;
  cumulativeScore: number;
  attendanceStatus: string | null;
}

function getAttendancePoints(estado: string | null): number {
  if (!estado) return 0;
  if (estado === 'presente') return 1;
  if (estado === 'justificado' || estado === 'justificada') return 0.5;
  return 0;
}

function getAttendanceLabel(estado: string | null): string {
  if (!estado) return 'Sin registro';
  if (estado === 'presente') return 'Presente';
  if (estado === 'justificado' || estado === 'justificada') return 'Justificado';
  return 'Ausente';
}

export default function PuntuacionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [seasonName, setSeasonName] = useState('');
  const [scoreEntries, setScoreEntries] = useState<ScoreEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current event to get temporada_id
      const { data: eventData, error: eventError } = await supabase
        .from('eventos')
        .select('titulo, temporada_id')
        .eq('id', params.id)
        .single();

      if (eventError) throw eventError;
      if (eventData) {
        setEventTitle(eventData.titulo);

        // 2. Fetch season name
        if (eventData.temporada_id) {
          const { data: seasonData } = await supabase
            .from('temporadas')
            .select('nombre')
            .eq('id', eventData.temporada_id)
            .single();
          if (seasonData) setSeasonName(seasonData.nombre);
        }

        // 3. Fetch all events in this season
        const { data: seasonEvents, error: eventsError } = await supabase
          .from('eventos')
          .select('id, titulo, fecha_inicio')
          .eq('temporada_id', eventData.temporada_id)
          .order('fecha_inicio', { ascending: true });

        if (eventsError) throw eventsError;

        const allEvents: EventoTemporada[] = seasonEvents || [];
        const currentEventId = params.id as string;

        // 4. Fetch all costaleros
        const { data: costalerosData, error: costalerosError } = await supabase
          .from('costaleros')
          .select('id, nombre, apellidos, apodo, trabajadera, puesto')
          .eq('rol', 'costalero')
          .order('trabajadera', { ascending: true })
          .order('apellidos', { ascending: true });

        if (costalerosError) throw costalerosError;

        // 5. Fetch all asistencias for all events in this season
        const eventIds = allEvents.map((e) => e.id);
        let allAsistencias: Asistencia[] = [];

        if (eventIds.length > 0) {
          const { data: asistenciasData, error: asistenciasError } = await supabase
            .from('asistencias')
            .select('evento_id, costalero_id, estado')
            .in('evento_id', eventIds);

          if (asistenciasError) throw asistenciasError;
          allAsistencias = asistenciasData || [];
        }

        // 6. Calculate scores
        const entries: ScoreEntry[] = (costalerosData || []).map((costalero) => {
          // Find attendance for current event
          const currentAttendance = allAsistencias.find(
            (a) => a.evento_id === currentEventId && a.costalero_id === costalero.id
          );
          const eventScore = getAttendancePoints(currentAttendance?.estado || null);

          // Calculate cumulative score across all events in season
          const costaleroAsistencias = allAsistencias.filter(
            (a) => a.costalero_id === costalero.id
          );
          const cumulativeScore = costaleroAsistencias.reduce(
            (sum, a) => sum + getAttendancePoints(a.estado),
            0
          );

          return {
            costalero,
            eventScore,
            cumulativeScore,
            attendanceStatus: currentAttendance?.estado || null,
          };
        });

        // Sort by trabajadera, then by cumulative score (desc), then by apellidos
        entries.sort((a, b) => {
          if (a.costalero.trabajadera !== b.costalero.trabajadera) {
            return a.costalero.trabajadera - b.costalero.trabajadera;
          }
          if (b.cumulativeScore !== a.cumulativeScore) {
            return b.cumulativeScore - a.cumulativeScore;
          }
          return a.costalero.apellidos.localeCompare(b.costalero.apellidos);
        });

        setScoreEntries(entries);
      }
    } catch (e) {
      console.error('Error fetching puntuacion data:', e);
      setError('No se pudieron cargar las puntuaciones');
    } finally {
      setLoading(false);
    }
  };

  // Group by trabajadera
  const groupedByTrabajadera = scoreEntries.reduce<Record<number, ScoreEntry[]>>((acc, entry) => {
    const t = entry.costalero.trabajadera;
    if (!acc[t]) acc[t] = [];
    acc[t].push(entry);
    return acc;
  }, {});

  const sortedTrabajaderas = Object.keys(groupedByTrabajadera)
    .map(Number)
    .sort((a, b) => a - b);

  // Filter by search
  const filteredEntries = scoreEntries.filter((entry) => {
    const name = getDisplayName(entry.costalero).toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const filteredGrouped = filteredEntries.reduce<Record<number, ScoreEntry[]>>((acc, entry) => {
    const t = entry.costalero.trabajadera;
    if (!acc[t]) acc[t] = [];
    acc[t].push(entry);
    return acc;
  }, {});

  const filteredTrabajaderas = Object.keys(filteredGrouped)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Error al cargar puntuaciones" description={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <PageHeader
        title="Puntuación"
        back={{ onClick: () => router.back() }}
      />

      {/* Season & Event Info */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-4 space-y-2">
          <div className="flex items-center gap-2 text-neutral-400">
            <Trophy size={16} />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {seasonName ? `Temporada ${seasonName}` : 'Sin temporada'}
            </span>
          </div>
          <p className="font-black text-neutral-900 text-lg uppercase tracking-tight italic">
            {eventTitle}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-bold">
            <span>Presente: <span className="text-emerald-600">1 pt</span></span>
            <span>Justificado: <span className="text-amber-500">0.5 pts</span></span>
            <span>Ausente: <span className="text-red-500">0 pts</span></span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="Buscar costalero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 rounded-2xl bg-white border-black/5"
          />
        </div>
      </div>

      {/* Score List */}
      <div className="px-4 space-y-6">
        {(searchTerm ? filteredTrabajaderas : sortedTrabajaderas).map((t) => {
          const entries = searchTerm ? filteredGrouped[t] : groupedByTrabajadera[t];
          if (!entries || entries.length === 0) return null;

          return (
            <div key={t}>
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tighter italic mb-2">
                Trabajadera {t}
              </h3>
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.costalero.id}
                    className="bg-white rounded-[20px] border border-black/5 shadow-sm p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 text-sm truncate">
                          {getDisplayName(entry.costalero)}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                          {entry.costalero.puesto}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Event Score */}
                      <div className="text-center">
                        <p className={cn(
                          'text-lg font-black leading-none',
                          entry.eventScore === 1 ? 'text-emerald-600' :
                          entry.eventScore === 0.5 ? 'text-amber-500' :
                          'text-red-500'
                        )}>
                          {entry.eventScore.toFixed(1)}
                        </p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight mt-0.5">
                          Evento
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-8 bg-neutral-200" />

                      {/* Cumulative Score */}
                      <div className="text-center">
                        <p className="text-lg font-black text-neutral-900 leading-none">
                          {entry.cumulativeScore.toFixed(1)}
                        </p>
                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight mt-0.5">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {scoreEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400 font-bold text-sm">
              No hay costaleros registrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
