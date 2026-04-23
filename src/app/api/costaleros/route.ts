import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configurar el endpoint para no cachearse y servir datos en tiempo real
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // 1. Obtener la cabecera de Autorización
    const authHeader = request.headers.get("Authorization");

    // 2. Verificar si existe y tiene el formato correcto "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "No autorizado. Se requiere un token válido." },
            { status: 401 }
        );
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.API_SECRET_KEY;

    // 3. Validar el token contra nuestra variable de entorno
    if (!secretKey || token !== secretKey) {
        return NextResponse.json(
            { error: "No autorizado. Token inválido." },
            { status: 401 }
        );
    }

    // 4. Inicializar cliente de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json(
            { error: "Error interno: Configuración de base de datos no encontrada." },
            { status: 500 }
        );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 5. Recuperar solo los datos solicitados
    const { data, error } = await supabase
        .from("costaleros")
        .select("nombre, apellidos, apodo, trabajadera, email");

    if (error) {
        return NextResponse.json(
            { error: `Error al obtener datos: ${error.message}` },
            { status: 500 }
        );
    }

    // 6. Devolver respuesta exitosa con los datos
    return NextResponse.json(data, { status: 200 });
}
