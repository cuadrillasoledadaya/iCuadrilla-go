// Rate limiting simple - no invasivo, fácil de remover
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60000; // 1 minute

export async function rateLimit(identifier: string): Promise<{ success: boolean }> {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { success: true };
  }

  if (record.count >= RATE_LIMIT) {
    return { success: false };
  }

  record.count += 1;
  return { success: true };
}
