import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

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

    if (session) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full space-y-12 relative z-10 flex flex-col items-center">
                {/* Logo Section */}
                <div className="relative group animate-in fade-in zoom-in duration-1000">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-700" />
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                        <Image
                            src="/escudo.png"
                            alt="Escudo Hermandad"
                            fill
                            className="object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            priority
                        />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl italic uppercase">
                        iCuadrilla
                    </h1>
                    <p className="text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
                        La gestión de tu cuadrilla,<br />en la palma de tu mano.
                    </p>
                </div>

                {/* Actions */}
                <div className="w-full space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 text-center">
                    <Link
                        href="/login"
                        className="group relative flex items-center justify-center w-full rounded-2xl bg-white px-8 py-5 text-xl font-black text-black transition-all hover:bg-neutral-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative">Entrar en la Aplicación</span>
                    </Link>

                    <Link
                        href="/registro"
                        className="block text-neutral-500 hover:text-emerald-400 transition-all font-bold text-sm tracking-widest uppercase py-2"
                    >
                        ¿Aún no tienes cuenta? <span className="text-emerald-500 group-hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4 tracking-normal">Regístrate aquí</span>
                    </Link>

                    <div className="pt-8 opacity-50">
                        <div className="h-[1px] w-12 bg-neutral-800 mx-auto mb-6" />
                        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.6em] font-black">
                            Sistema Privado y Reservado
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
