import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

// Configurar el endpoint para no cachearse y servir datos en tiempo real
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 0. Rate limiting por IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success } = await rateLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Inténtelo más tarde.' },
      { status: 429 }
    );
  }

  // 1. Obtener la cabecera de Autorización
  const authHeader = request.headers.get('Authorization');

  // 2. Verificar si existe y tiene el formato correcto "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere un token válido.' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.API_SECRET_KEY;

  // 3. Validar el token contra nuestra variable de entorno (timing-safe)
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

  // 4. Inicializar cliente de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Error interno: Configuración de base de datos no encontrada.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 5. Recuperar solo los datos solicitados (activos únicamente)
  const { data, error } = await supabase
    .from('costaleros')
    .select('id, nombre, apellidos, apodo, trabajadera, puesto, puesto_secundario, email')
    .eq('estado', 'activo');

  if (error) {
    return NextResponse.json(
      { error: `Error al obtener datos: ${error.message}` },
      { status: 500 }
    );
  }

  // 6. Devolver respuesta exitosa con los datos
  return NextResponse.json(data, { status: 200 });
}
