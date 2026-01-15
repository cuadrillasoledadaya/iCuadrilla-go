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

                // Admin identification
                const isAdminEmail = user.email === 'proyectoszipi@gmail.com';
                setIsAdmin(isAdminEmail);

                // Costalero identification
                const { data, error } = await supabase
                    .from('costaleros')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setIsCostalero(true);
                    setCostaleroId(data.id);
                } else {
                    setIsCostalero(false);
                }

                // If not identified by specialized admin email but not in costaleros,
                // we might treat them as admin by default for transition or if the system allows it.
                // However, based on requirements, we now want explicit independence.
                // If it's not the zipi email AND they are not in costaleros, we'll assume they are an "other" admin
                // (e.g. Capataz) unless we have a 'roles' table.
                if (!isAdminEmail && !data) {
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
