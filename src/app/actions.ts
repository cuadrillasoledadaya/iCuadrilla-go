'use server';

/**
 * Verifica si un email corresponde al Master Administrator.
 * Esta verificación se realiza en el servidor para no exponer el email maestro al cliente.
 */
export async function checkIsMaster(email: string | undefined | null): Promise<boolean> {
    if (!email) return false;

    // Fallback hardcoded de emergencia para asegurar acceso
    const masterEmail = (process.env.MASTER_EMAIL || 'proyectoszipi@gmail.com').trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    console.log("Server Action: Checking", normalizedEmail, "against", masterEmail); // DEBUG

    return normalizedEmail === masterEmail;
}
