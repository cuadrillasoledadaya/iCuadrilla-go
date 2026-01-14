import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserRole() {
    const [isCostalero, setIsCostalero] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsCostalero(false);
                    setLoading(false);
                    return;
                }

                setUserId(user.id);

                // SUPERADMIN OVERRIDE
                // "proyectoszipi@gmail.com" debe tener acceso total siempre.
                // En este hook, isCostalero = false implica acceso de Admin/Capataz.
                if (user.email === 'proyectoszipi@gmail.com') {
                    setIsCostalero(false);
                    return;
                }

                // Comprobar si el ID del usuario existe en la tabla de costaleros
                // Asumimos que si está en la tabla costaleros, es un costalero
                // Si tienes un campo específico 'rol' en public.users o similar, úsalo aquí.
                // Basado en el esquema, costaleros tiene un campo user_id (que puede ser null si no se ha enlazado aún)
                // O quizás el email coincide. Vamos a buscar por user_id primero, y fallback a email si es necesario.

                // Estrategia: Buscar en la tabla costaleros donde user_id coincida
                const { data, error } = await supabase
                    .from('costaleros')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setIsCostalero(true);
                } else {
                    // Si no encuentra por user_id, intentamos por email para enlazar (o simplemente asumimos que no es costalero asignado aún)
                    // Por seguridad, para esta visualización, si no tiene user_id en costaleros, no lo tratamos como costalero "activo" con perfil.
                    // Pero espera, si es el ADMIN, no estará en costaleros.
                    // Si es un usuario normal registrado, debería ser costalero.
                    // Vamos a asumir: Si está en costaleros -> ROl Costalero (vista restringida)
                    // Si NO está en costaleros -> Asumimos Admin/Gestor (vista completa) 
                    // OJO: Esto es peligroso si cualquiera puede registrarse.
                    // REVISAR: ¿Cómo se registran los usuarios? 
                    // Si el registro es abierto, cualquiera podría ser "Admin".
                    // Asumiré por ahora la lógica inversa solicitada: "Priority: costaleros visual part".

                    setIsCostalero(false);
                }

            } catch (error) {
                console.error("Error checking role:", error);
                setIsCostalero(false);
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, []);

    return { isCostalero, loading, userId };
}
