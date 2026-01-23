import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserRole() {
    const [isCostalero, setIsCostalero] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isMaster, setIsMaster] = useState<boolean | null>(null);
    const [rol, setRol] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [costaleroId, setCostaleroId] = useState<string | null>(null);

    // Permission flags
    const [canManageEvents, setCanManageEvents] = useState(false);
    const [canManageAnnouncements, setCanManageAnnouncements] = useState(false);
    const [canManageSeasons, setCanManageSeasons] = useState(false);
    const [canManageRoles, setCanManageRoles] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkRole = async (sessionUser?: any) => {
            try {
                // Si nos pasan un usuario (desde el evento), usamos ese. Si no, fetch.
                let user = sessionUser;

                if (!user) {
                    const { data } = await supabase.auth.getUser();
                    user = data.user;
                }

                if (!mounted) return;

                if (!user) {
                    setIsCostalero(false);
                    setIsAdmin(false);
                    setIsMaster(false);
                    setRol(null);
                    setUserId(null);
                    setCostaleroId(null);

                    // Reset permissions
                    setCanManageEvents(false);
                    setCanManageAnnouncements(false);
                    setCanManageSeasons(false);
                    setCanManageRoles(false);

                    setLoading(false);
                    return;
                }

                setUserId(user.id);

                // 1. Identificar por Email Maestro (SUPERADMIN)
                const masterEmail = process.env.NEXT_PUBLIC_MASTER_EMAIL;
                const isMasterEmail = !!(masterEmail && user.email === masterEmail);
                setIsMaster(isMasterEmail);

                // 2. Buscar en tabla costaleros
                const { data: costaleroData, error } = await supabase
                    .from('costaleros')
                    .select('id, rol')
                    .eq('user_id', user.id)
                    .single();

                if (!mounted) return;

                let currentRol = 'costalero';

                if (costaleroData) {
                    setIsCostalero(true);
                    setCostaleroId(costaleroData.id);
                    currentRol = costaleroData.rol || 'costalero';
                    setRol(currentRol);
                } else {
                    setIsCostalero(false);
                    setRol(null);
                }

                // 3. Determinar permisos de Admin
                const isEffectiveAdmin = isMasterEmail || !costaleroData || currentRol === 'capataz' || currentRol === 'auxiliar';
                setIsAdmin(isEffectiveAdmin);

                // 4. Configurar Flags de Permisos
                setCanManageEvents(isMasterEmail || currentRol === 'capataz' || currentRol === 'auxiliar');
                setCanManageAnnouncements(isMasterEmail || currentRol === 'capataz' || currentRol === 'auxiliar');
                setCanManageSeasons(isMasterEmail);
                setCanManageRoles(isMasterEmail);

            } catch (error) {
                console.error("Error checking role:", error);
                if (mounted) {
                    setIsCostalero(false);
                    setIsAdmin(false);
                    setIsMaster(false);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
                checkRole(session?.user);
            } else if (event === 'SIGNED_OUT') {
                checkRole(null);
            }
        });

        // Ejecutar check inicial
        checkRole();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return {
        isCostalero,
        isAdmin,
        isMaster,
        rol,
        loading,
        userId,
        costaleroId,
        canManageEvents,
        canManageAnnouncements,
        canManageSeasons,
        canManageRoles
    };
}
