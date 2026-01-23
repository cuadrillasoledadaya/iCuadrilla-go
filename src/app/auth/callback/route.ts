import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (process.env.NODE_ENV === 'development') {
        console.log('--- Iniciando Intercambio de Código ---');
    }

    if (code) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Code:', code.substring(0, 10) + '...');
        }
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value, ...options })
                        } catch (e) {
                            console.warn('Cookie set error:', e);
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: '', ...options })
                        } catch (e) {
                            console.warn('Cookie remove error:', e);
                        }
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Intercambio exitoso. Usuario:', data.user?.email);
            }
            // Handle password recovery redirect
            const redirectPath = next.startsWith('/nueva-contrasena') ? '/nueva-contrasena' : next;
            return NextResponse.redirect(`${origin}${redirectPath}`)
        }

        console.error('Error Supabase exchangeCodeForSession:', error.message, error.status);
    } else {
        if (process.env.NODE_ENV === 'development') {
            console.warn('Callback alcanzado sin parámetro "code".');
        }
    }

    // Si hay error o no hay código, redirigir al login con error
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
