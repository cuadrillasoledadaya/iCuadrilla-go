import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserRole() {
    const [isCostalero, setIsCostalero] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
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
                    setLoading(false);
                    return;
                }

                setUserId(user.id);

                // 1. Identificar por Email Maestro
                const isMasterAdmin = user.email === 'proyectoszipi@gmail.com';

                // 2. Buscar en tabla costaleros
                const { data: costaleroData } = await supabase
                    .from('costaleros')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (costaleroData) {
                    setIsCostalero(true);
                    setCostaleroId(costaleroData.id);
                    // Si está en la tabla costaleros, solo es admin si es el email maestro
                    setIsAdmin(isMasterAdmin);
                } else {
                    setIsCostalero(false);
                    // Si no está en la tabla costaleros, lo tratamos como Admin (Capataz)
                    setIsAdmin(true);
                }

            } catch (error) {
                console.error("Error checking role:", error);
                setIsCostalero(false);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, []);

    return { isCostalero, isAdmin, loading, userId, costaleroId };
}
