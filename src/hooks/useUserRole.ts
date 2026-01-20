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
        const checkRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsCostalero(false);
                    setIsAdmin(false);
                    setIsMaster(false);
                    setLoading(false);
                    return;
                }

                setUserId(user.id);

                // 1. Identificar por Email Maestro (SUPERADMIN)
                const isMasterEmail = user.email === 'proyectoszipi@gmail.com';
                setIsMaster(isMasterEmail);

                // 2. Buscar en tabla costaleros (Incluyendo el nuevo campo ROL)
                const { data: costaleroData } = await supabase
                    .from('costaleros')
                    .select('id, rol')
                    .eq('user_id', user.id)
                    .single();

                let currentRol = 'costalero';

                if (costaleroData) {
                    setIsCostalero(true);
                    setCostaleroId(costaleroData.id);
                    currentRol = costaleroData.rol || 'costalero';
                    setRol(currentRol);
                } else {
                    setIsCostalero(false);
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
                setIsCostalero(false);
                setIsAdmin(false);
                setIsMaster(false);
            } finally {
                setLoading(false);
            }
        };

        checkRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkRole();
        });

        return () => {
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
