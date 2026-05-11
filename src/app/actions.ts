'use server';

/**
 * Verifica si un email corresponde al Master Administrator.
 * Esta verificación se realiza en el servidor para no exponer el email maestro al cliente.
 *
 * Test scenarios (no test runner configured — manual verification):
 *   - MASTER_EMAIL=test@example.com, email="test@example.com"       → true
 *   - MASTER_EMAIL unset, email="any@email.com"                     → false (fail-closed)
 *   - MASTER_EMAIL="", email="any@email.com"                        → false (fail-closed)
 *   - email=null / email=undefined                                  → false (null guard)
 *   - MASTER_EMAIL="TEST@EXAMPLE.COM", email="test@example.com"     → true (case-insensitive)
 */
export async function checkIsMaster(email: string | undefined | null): Promise<boolean> {
  if (!email) return false;

  // Fail closed: if MASTER_EMAIL is unset or empty, deny master access
  const masterEmail = process.env.MASTER_EMAIL?.trim().toLowerCase();
  if (!masterEmail) return false;

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail === masterEmail;
}
