import Link from "next/link";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // Si ya tiene sesión, redirigir automáticamente al dashboard
    if (session) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
            <div className="max-w-md w-full space-y-8">
                <h1 className="text-6xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl">
                    iCuadrilla
                </h1>
                <p className="text-neutral-500 text-lg sm:text-xl font-medium">
                    La gestión de tu cuadrilla, <br className="hidden sm:block" />en la palma de tu mano.
                </p>
                <div className="flex flex-col gap-4 pt-12">
                    <Link
                        href="/login"
                        className="rounded-2xl bg-white px-8 py-5 text-xl font-black text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                        Entrar en la Aplicación
                    </Link>
                    <Link
                        href="/registro"
                        className="text-neutral-600 hover:text-white transition-colors font-bold text-sm tracking-wide"
                    >
                        ¿AÚN NO TIENES CUENTA? REGÍSTRATE AQUÍ
                    </Link>
                    <p className="text-[10px] text-neutral-800 uppercase tracking-[0.4em] font-black pt-8">
                        Sistema Privado y Reservado
                    </p>
                </div>
            </div>
        </main>
    );
}
