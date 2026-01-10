"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

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
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        });

        if (signUpError) {
            setMessage(`Error: ${signUpError.message}`);
        } else {
            setMessage("¡Registro completado! Ya puedes iniciar sesión.");
            setTimeout(() => router.push("/login"), 2000);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Crear Cuenta</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Solo para costaleros autorizados
                    </p>
                </div>

                <form onSubmit={handleRegistro} className="mt-8 space-y-4">
                    <Input
                        type="email"
                        placeholder="Email registrado"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-neutral-900 border-neutral-800 text-white"
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-neutral-900 border-neutral-800 text-white pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {message && (
                        <div className={`text-sm text-center p-3 rounded-md ${message.includes("¡") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                            {message}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full h-12 bg-white text-black font-bold">
                        {loading ? "Registrando..." : "Registrarse"}
                    </Button>
                </form>

                <p className="text-center text-sm text-neutral-400">
                    ¿Ya tienes cuenta? <Link href="/login" className="text-white hover:underline">Entra aquí</Link>
                </p>
            </div>
        </div>
    );
}
