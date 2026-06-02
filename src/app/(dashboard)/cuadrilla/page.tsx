'use client';

import { useState } from 'react';
import {
  Search,
  UserPlus,
  ChevronRight,
  Users,
  Filter,
  ChevronLeft,
  History,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { useCuadrilla, type Costalero } from '@/hooks/useCuadrilla';
import { getDisplayName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export default function CuadrillaList() {
  const router = useRouter();
  const { isAdmin, isMaster, loading: roleLoading } = useUserRole();
  const { costaleros, loading, refetch } = useCuadrilla();
  const [search, setSearch] = useState('');
  const [selectedCostalero, setSelectedCostalero] = useState<string | null>(null);

  const filtered = (costaleros ?? []).filter((c) =>
    `${c.apodo || ''} ${c.nombre} ${c.apellidos}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
      <PageHeader
        title="La Cuadrilla"
        subtitle="Listado de Hermanos Costaleros"
        back
        rightSlot={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center">
                <Plus size={24} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white rounded-3xl border-black/5 shadow-2xl p-2 animate-in zoom-in-95 duration-200"
            >
              <DropdownMenuItem
                onClick={() => router.push('/cuadrilla/movimientos')}
                className="flex items-center gap-3 p-4 rounded-2xl focus:bg-primary/5 text-neutral-600 focus:text-primary cursor-pointer transition-colors"
              >
                <History size={20} className="text-neutral-400 group-focus:text-primary" />
                <span className="font-bold uppercase tracking-widest text-[10px]">
                  Ver Historial
                </span>
              </DropdownMenuItem>
              {(isAdmin || isMaster) && (
                <DropdownMenuItem
                  onClick={() => router.push('/costaleros/nuevo')}
                  className="flex items-center gap-3 p-4 rounded-2xl focus:bg-primary/5 text-neutral-600 focus:text-primary cursor-pointer transition-colors"
                >
                  <UserPlus size={20} className="text-neutral-400 group-focus:text-primary" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">
                    Nueva Alta
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Búsqueda y Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <Input
            placeholder="Buscar por nombre..."
            className="bg-white pl-12 h-14 border-black/5 shadow-sm rounded-2xl text-neutral-900 placeholder:text-neutral-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-4 bg-white border border-black/5 shadow-sm rounded-2xl text-neutral-400 hover:text-primary transition-colors">
          <Filter size={24} />
        </button>
      </div>

      {/* Listado */}
      <div className="space-y-8">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((t) => {
          const costalerosInTrabajadera = filtered.filter((c) => c.trabajadera === t);
          if (costalerosInTrabajadera.length === 0) return null;

          return (
            <div key={t} className="space-y-4">
              {/* Sticky Header */}
              <div className="sticky top-0 z-20 py-2 -mx-6 px-6 bg-background/80 backdrop-blur-md border-b border-black/5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black tracking-widest uppercase text-primary italic">
                    Trabajadera {t}
                  </h2>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                    {costalerosInTrabajadera.length}{' '}
                    {costalerosInTrabajadera.length === 1 ? 'Hermano' : 'Hermanos'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {costalerosInTrabajadera.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCostalero(c.id)}
                    className="bg-white p-5 rounded-[24px] flex items-center justify-between group cursor-pointer border border-black/5 shadow-sm hover:border-primary/20 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black text-xl italic border border-primary/10">
                        {c.trabajadera}
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold text-neutral-900 text-lg tracking-tight italic">
                          {getDisplayName(c)}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">
                          {c.puesto || 'Costalero'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className="text-neutral-200 group-hover:text-primary transition-colors"
                      size={24}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState icon={Users} title="No se encontraron costaleros" />
        )}
      </div>

      <Modal
        isOpen={!!selectedCostalero}
        onClose={() => setSelectedCostalero(null)}
        title="Acciones de Costalero"
      >
        <div className="space-y-3 p-2">
          <button
            onClick={() => router.push(`/cuadrilla/${selectedCostalero}`)}
            className="w-full h-14 rounded-2xl bg-neutral-50 text-neutral-700 font-bold flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all border border-black/5 shadow-sm"
          >
            Ver Ficha Detallada
          </button>
          {(isAdmin || isMaster) && (
            <>
              <button
                onClick={() => router.push(`/cuadrilla/${selectedCostalero}/editar`)}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all"
              >
                Editar Información
              </button>
              <button
                onClick={() => router.push(`/cuadrilla/${selectedCostalero}/baja`)}
                className="w-full h-14 rounded-2xl bg-red-600/10 border border-red-600/30 text-red-500 font-bold flex items-center justify-center gap-3 hover:bg-red-600/20 transition-all"
              >
                Tramitar Baja
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
