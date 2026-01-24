"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { getSiteUrl } from "@/lib/utils";

export default function RegistroPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const cleanEmail = email.trim().toLowerCase();

        // Paso 1: Verificar Whitelist
        const { data: isAuthorized, error: whitelistError } = await supabase
            .rpc("es_email_autorizado", { email_input: cleanEmail });

        if (whitelistError || !isAuthorized) {
            setMessage("Este email no tiene permiso para registrarse. Contacta con el Capataz.");
            setLoading(false);
            return;
        }

        // Paso 2: Registro en Supabase Auth
        const { error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
                emailRedirectTo: `${getSiteUrl()}auth/callback`,
            }
        });

        if (signUpError) {
            setMessage(`Error: ${signUpError.message}`);
        } else {
            setMessage("¡Registro completado! Te redirigiendo...");
            setTimeout(() => router.push("/login"), 2000);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

            <div className="w-full max-w-sm flex flex-col items-center relative z-10">

                {/* Logo & Header */}
                <div className="flex flex-col items-center text-center space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative w-32 h-32 drop-shadow-2xl">
                        <Image
                            src="/icons/icon-512x512.png"
                            alt="Escudo Hermandad"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-2xl font-serif text-white tracking-wide">
                            Hermandad de la<br />Soledad
                        </h1>
                        <p className="text-[10px] text-neutral-500 font-bold tracking-[0.4em] uppercase">
                            AYAMONTE
                        </p>
                        <p className="text-emerald-500 font-medium italic text-sm pt-2">
                            Registro de Costaleros
                        </p>
                    </div>
                </div>

                {/* Registro Card */}
                <div className="w-full bg-[#1A1A1A] rounded-[32px] p-8 border border-white/5 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <form onSubmit={handleRegistro} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 pl-1">Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-[#0A0A0A] border-white/5 h-14 rounded-2xl text-white pl-12 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-neutral-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 pl-1">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[#0A0A0A] border-white/5 h-14 rounded-2xl text-white pl-12 pr-12 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-neutral-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {message && (
                            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${message.includes("¡") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                                <AlertCircle size={16} />
                                {message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? "Verificando..." : "Crear Cuenta"}
                        </Button>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4 animate-in fade-in duration-1000 delay-300">
                    <p className="text-sm text-neutral-500">
                        ¿Ya tienes cuenta? <Link href="/login" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">Inicia Sesión</Link>
                    </p>

                    <p className="text-[10px] text-neutral-700 uppercase tracking-widest pt-8">
                        Hermandad de la Soledad
                    </p>
                </div>
            </div>
        </div>
    );
}
