import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 0. Rate limiting
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success } = await rateLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Inténtelo más tarde.' },
      { status: 429 }
    );
  }

  // 1. Auth
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere un token válido.' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.API_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: 'No autorizado. Token inválido.' }, { status: 401 });
  }

  try {
    const tokenBuf = Buffer.from(token);
    const secretBuf = Buffer.from(secretKey);
    if (tokenBuf.length !== secretBuf.length || !timingSafeEqual(tokenBuf, secretBuf)) {
      return NextResponse.json({ error: 'No autorizado. Token inválido.' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'No autorizado. Token inválido.' }, { status: 401 });
  }

  // 2. DB Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Error interno: Configuración de base de datos no encontrada.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 3. Fetch active season
  const { data: temporada, error } = await supabase
    .from('temporadas')
    .select('id, nombre, activa')
    .eq('activa', true)
    .single();

  if (error || !temporada) {
    return NextResponse.json(
      { error: 'No hay una temporada activa configurada.' },
      { status: 500 }
    );
  }

  return NextResponse.json(temporada, { status: 200 });
}
