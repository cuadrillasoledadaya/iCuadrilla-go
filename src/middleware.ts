import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protección de rutas
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/registro') ||
        request.nextUrl.pathname.startsWith('/recuperar') ||
        request.nextUrl.pathname.startsWith('/auth')
    const isRootPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname === ''

    // Si no hay usuario y no estamos en login/registro o la raíz, redirigir a login
    if (!user && !isAuthPage && !isRootPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si hay usuario e intentamos entrar a login/registro, redirigir a dashboard
    // PERO permitimos que el usuario vea la raíz (/) para ver la pantalla de bienvenida
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 🔒 VERIFICACIÓN DE ROLES (Security Fix)
    // Rutas que solo pueden acceder usuarios con rol de administrador o superior
    const adminOnlyRoutes = ['/ajustes/roles', '/temporadas', '/cuadrilla'];
    const adminOrAuxiliarRoutes = ['/asistencia/scanner'];

    // Verificar si estamos intentando acceder a una ruta protegida
    const pathname = request.nextUrl.pathname;
    const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));
    const isAdminOrAuxiliarRoute = adminOrAuxiliarRoutes.some(route => pathname.startsWith(route));

    if (user && (isAdminRoute || isAdminOrAuxiliarRoute)) {
        // Verificar el rol del usuario en la base de datos
        const { data: costaleroData } = await supabase
            .from('costaleros')
            .select('rol')
            .eq('user_id', user.id)
            .single();

        const userRole = costaleroData?.rol || 'costalero';
        const masterEmail = process.env.MASTER_EMAIL;
        const isMaster = masterEmail && user.email === masterEmail;

        // Verificar permisos según el tipo de ruta
        if (isAdminRoute) {
            // Rutas admin: solo master, capataz o auxiliar
            const hasAdminAccess = isMaster || userRole === 'capataz' || userRole === 'auxiliar';
            if (!hasAdminAccess) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        if (isAdminOrAuxiliarRoute) {
            // Rutas admin/auxiliar: solo master, capataz o auxiliar
            const hasAccess = isMaster || userRole === 'capataz' || userRole === 'auxiliar';
            if (!hasAccess) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
