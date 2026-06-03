'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, Clock, Trash2, Check, Trophy } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  created_at: string;
  leido: boolean;
  tipo: string;
  costalero_id?: string;
  evento_id?: string;
  destinatario?: string; // Added this to handle dual roles
}

export default function NotificacionesPage() {
  const router = useRouter();
  const { isCostalero, isAdmin, loading: roleLoading, costaleroId } = useUserRole();
  const toast = useToast();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [pendingJustify, setPendingJustify] = useState<
    { notificationId: string; eventoId: string; costaleroId: string } | null
  >(null);
  const [pendingAusente, setPendingAusente] = useState<
    { notificationId: string; eventoId: string; costaleroId: string } | null
  >(null);
  const [deletingNotifId, setDeletingNotifId] = useState<string | null>(null);

  const fetchNotificaciones = async () => {
    const queries = [];

    if (isAdmin) {
      queries.push(supabase.from('notificaciones').select('*').eq('destinatario', 'admin'));
    }

    if (isCostalero && costaleroId) {
      queries.push(
        supabase
          .from('notificaciones')
          .select('*')
          .eq('destinatario', 'costalero')
          .eq('costalero_id', costaleroId)
      );
    }

    const results = await Promise.all(queries);
    const allNotifs = results.flatMap((r) => r.data || []);

    // Sort by date manually since we fetched from two sources
    allNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotificaciones(allNotifs);
    setLoading(false);
  };

  useEffect(() => {
    if (!roleLoading) {
      fetchNotificaciones();
    }
  }, [roleLoading, isCostalero, costaleroId, isAdmin]); // Added isAdmin to dependencies

  const requestDeleteAll = () => {
    setShowDeleteAllDialog(true);
  };

  const confirmDeleteAll = async () => {
    setShowDeleteAllDialog(false);

    setNotificaciones([]);

    const deletePromises = [];
    if (isAdmin) {
      deletePromises.push(supabase.from('notificaciones').delete().eq('destinatario', 'admin'));
    }
    if (isCostalero && costaleroId) {
      deletePromises.push(
        supabase
          .from('notificaciones')
          .delete()
          .eq('destinatario', 'costalero')
          .eq('costalero_id', costaleroId)
      );
    }

    await Promise.all(deletePromises);
    router.refresh();
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)));

    await supabase.from('notificaciones').update({ leido: true }).eq('id', id);

    // Refresh to ensure sync (optional)
    router.refresh();
  };

  const markAllAsRead = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));

    const updatePromises = [];
    if (isAdmin) {
      updatePromises.push(
        supabase
          .from('notificaciones')
          .update({ leido: true })
          .eq('leido', false)
          .eq('destinatario', 'admin')
      );
    }
    if (isCostalero && costaleroId) {
      updatePromises.push(
        supabase
          .from('notificaciones')
          .update({ leido: true })
          .eq('leido', false)
          .eq('destinatario', 'costalero')
          .eq('costalero_id', costaleroId)
      );
    }

    await Promise.all(updatePromises);
    router.refresh();
  };

  const handleJustify = (notificationId: string, eventoId: string, costaleroId: string) => {
    setPendingJustify({ notificationId, eventoId, costaleroId });
  };

  const confirmJustify = async () => {
    if (!pendingJustify) return;
    const { notificationId, eventoId, costaleroId } = pendingJustify;
    setPendingJustify(null);

    // 1. Update Asistencia to 'justificado'
    const { data, error: updateError } = await supabase
      .from('asistencias')
      .update({ estado: 'justificada' })
      .eq('evento_id', eventoId)
      .eq('costalero_id', costaleroId)
      .select();

    if (updateError) {
      toast.error('Error al justificar la asistencia: ' + updateError.message);
      return;
    }

    if (!data || data.length === 0) {
      toast.error('No se encontró la asistencia para actualizar. Verifica los IDs.');
      return;
    }

    // 2. Mark notification as read
    await supabase.from('notificaciones').update({ leido: true }).eq('id', notificationId);

    // Update UI
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, leido: true } : n))
    );

    toast.success('✅ Ausencia JUSTIFICADA correctamente.');
    router.refresh();
  };

  const handleConfirmAbsence = (
    notificationId: string,
    eventoId: string,
    costaleroId: string
  ) => {
    setPendingAusente({ notificationId, eventoId, costaleroId });
  };

  const confirmMarkAusente = async () => {
    if (!pendingAusente) return;
    const { notificationId, eventoId, costaleroId } = pendingAusente;
    setPendingAusente(null);

    // 1. Update Asistencia to 'ausente'
    const { data, error: updateError } = await supabase
      .from('asistencias')
      .update({ estado: 'ausente' })
      .eq('evento_id', eventoId)
      .eq('costalero_id', costaleroId)
      .select();

    if (updateError) {
      toast.error('Error al marcar la ausencia: ' + updateError.message);
      return;
    }

    // 2. Mark notification as read
    await supabase.from('notificaciones').update({ leido: true }).eq('id', notificationId);

    // Update UI
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, leido: true } : n))
    );

    toast.success('✅ Ausencia confirmada.');
    router.refresh();
  };

  const confirmDeleteNotif = async () => {
    if (!deletingNotifId) return;
    const id = deletingNotifId;
    setDeletingNotifId(null);
    await deleteNotification(id);
  };

  const deleteNotification = async (id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    await supabase.from('notificaciones').delete().eq('id', id);
    router.refresh();
  };

  if (roleLoading || loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );

  const unreadCount = notificaciones.filter((n) => !n.leido).length;

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
      {/* Header */}
      <PageHeader
        title="Notificaciones"
        back={{ onClick: () => router.back() }}
        primaryAction={
          unreadCount > 0
            ? {
                label: 'Marcar leídas',
                icon: <CheckCircle2 size={20} />,
                onClick: markAllAsRead,
                variant: 'outline',
              }
            : undefined
        }
      />

      {/* List */}
      <div className="space-y-4">
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              {unreadCount} Sin leer
            </p>
          </div>
        )}

        {notificaciones.length === 0 ? (
          <EmptyState icon={Bell} title="No tienes notificaciones" />
        ) : (
          <div className="space-y-3">
            {notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'relative bg-white p-5 rounded-[24px] border shadow-sm transition-all duration-300 group',
                  notif.leido
                    ? 'border-black/5 opacity-80'
                    : 'border-primary/20 shadow-primary/5 bg-primary/[0.02]'
                )}
              >
                {!notif.leido && (
                  <div className="absolute top-6 right-5 w-2 h-2 rounded-full bg-primary shadow-sm" />
                )}

                <div className="space-y-3 pr-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2.5 rounded-2xl',
                          notif.leido
                            ? 'bg-neutral-100 text-neutral-400'
                            : notif.tipo === 'aniversario'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-primary/10 text-primary'
                        )}
                      >
                        {notif.tipo === 'aniversario' ? <Trophy size={18} /> : <Bell size={18} />}
                      </div>
                      <div className="space-y-0.5">
                        <p
                          className={cn(
                            'text-xs font-bold uppercase tracking-widest',
                            notif.leido
                              ? 'text-neutral-400'
                              : notif.tipo === 'aniversario'
                                ? 'text-amber-600'
                                : 'text-primary'
                          )}
                        >
                          {notif.tipo === 'aniversario' ? 'Aniversario' : 'Ausencia'}
                        </p>
                        <p className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={cn(
                          'font-bold text-sm',
                          !notif.leido ? 'text-neutral-900' : 'text-neutral-500'
                        )}
                      >
                        {notif.titulo}
                      </h3>
                      {isAdmin && isCostalero && (
                        <span
                          className={cn(
                            'text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter',
                            notif.destinatario === 'admin'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-blue-100 text-blue-600'
                          )}
                        >
                          {notif.destinatario === 'admin' ? 'Admin' : 'Costalero'}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        'text-xs leading-relaxed',
                        !notif.leido ? 'text-neutral-600' : 'text-neutral-400'
                      )}
                    >
                      {notif.mensaje}
                    </p>
                  </div>

                  {/* Actions (Only for Admins/Capataces and Absence type) */}
                  {isAdmin && notif.tipo === 'ausencia' && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-black/5 mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJustify(notif.id, notif.evento_id!, notif.costalero_id!);
                          }}
                          className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          Justificar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmAbsence(notif.id, notif.evento_id!, notif.costalero_id!);
                          }}
                          className="flex-1 py-2.5 px-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                        >
                          Marcar Ausente
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Action Footer */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-dashed border-neutral-100 pl-12 mt-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        disabled={notif.leido}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                          notif.leido
                            ? 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
                            : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                        )}
                      >
                        {notif.leido ? (
                          <Check size={12} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        {notif.leido ? 'Leída' : 'Marcar leída'}
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingNotifId(notif.id);
                      }}
                      aria-label="Eliminar notificación"
                      className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        onConfirm={confirmDeleteAll}
        title="¿Eliminar todas las notificaciones?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar todo"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!pendingJustify}
        onClose={() => setPendingJustify(null)}
        onConfirm={confirmJustify}
        title="¿Justificar esta ausencia?"
        confirmLabel="Justificar"
        variant="default"
      />

      <ConfirmDialog
        isOpen={!!pendingAusente}
        onClose={() => setPendingAusente(null)}
        onConfirm={confirmMarkAusente}
        title="¿Marcar como AUSENTE (no justificado)?"
        confirmLabel="Marcar ausente"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!deletingNotifId}
        onClose={() => setDeletingNotifId(null)}
        onConfirm={confirmDeleteNotif}
        title="¿Eliminar esta notificación?"
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
