import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserRole() {
    const [isCostalero, setIsCostalero] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isMaster, setIsMaster] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [costaleroId, setCostaleroId] = useState<string | null>(null);

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

                // 2. Buscar en tabla costaleros
                const { data: costaleroData } = await supabase
                    .from('costaleros')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (costaleroData) {
                    setIsCostalero(true);
                    setCostaleroId(costaleroData.id);
                } else {
                    setIsCostalero(false);
                }

                // 3. Determinar permisos de Admin
                // Siempre es Admin si es el email maestro o si no está en la tabla de costaleros
                if (isMasterEmail || !costaleroData) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }

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
    }, []);

    return { isCostalero, isAdmin, isMaster, loading, userId, costaleroId };
}
