'use server';

/**
 * Verifica si un email corresponde al Master Administrator.
 * Esta verificación se realiza en el servidor para no exponer el email maestro al cliente.
 */
export async function checkIsMaster(email: string | undefined | null): Promise<boolean> {
    if (!email) return false;

    // Acceder a variable de entorno de servidor (sin NEXT_PUBLIC_)
    const masterEmail = process.env.MASTER_EMAIL;

    return !!(masterEmail && email === masterEmail);
}
