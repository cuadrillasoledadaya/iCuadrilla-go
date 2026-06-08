import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

// Configurar el endpoint para no cachearse y servir datos en tiempo real
export const dynamic = 'force-dynamic';

function getAttendancePoints(estado: string | null): number {
  if (!estado) return 0;
  if (estado === 'presente') return 1;
  if (estado === 'justificado' || estado === 'justificada') return 0.5;
  return 0;
}

export async function GET(request: Request) {
  // 0. Rate limiting por IP
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
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
  const { data: costalerosData, error: costalerosError } = await supabase
    .from('costaleros')
    .select('id, nombre, apellidos, apodo, trabajadera, puesto, puesto_secundario, email')
    .eq('estado', 'activo');

  if (costalerosError) {
    return NextResponse.json(
      { error: `Error al obtener datos: ${costalerosError.message}` },
      { status: 500 }
    );
  }

  // 6. Calcular puntuación acumulada de la temporada activa
  let puntuacionMap: Record<string, number> = {};

  try {
    // 6a. Obtener temporada activa
    const { data: temporadaActiva } = await supabase
      .from('temporadas')
      .select('id')
      .eq('activa', true)
      .single();

    if (temporadaActiva) {
      // 6b. Obtener todos los eventos de la temporada
      const { data: eventos } = await supabase
        .from('eventos')
        .select('id')
        .eq('temporada_id', temporadaActiva.id);

      if (eventos && eventos.length > 0) {
        const eventIds = eventos.map((e) => e.id);

        // 6c. Obtener todas las asistencias de esos eventos
        const { data: asistencias } = await supabase
          .from('asistencias')
          .select('costalero_id, estado')
          .in('evento_id', eventIds);

        if (asistencias) {
          // 6d. Calcular puntuación acumulada por costalero
          puntuacionMap = asistencias.reduce<Record<string, number>>((acc, a) => {
            acc[a.costalero_id] = (acc[a.costalero_id] || 0) + getAttendancePoints(a.estado);
            return acc;
          }, {});
        }
      }
    }
  } catch {
    // Si falla el cálculo de puntuación, continuar sin ella (campo será 0)
  }

  // 7. Devolver respuesta exitosa con los datos incluyendo puntuación total
  const responseData = (costalerosData || []).map((c) => ({
    ...c,
    puntuacion_total: puntuacionMap[c.id] || 0,
  }));

  return NextResponse.json(responseData, { status: 200 });
}
