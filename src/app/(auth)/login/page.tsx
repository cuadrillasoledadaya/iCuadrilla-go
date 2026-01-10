"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const cleanEmail = email.trim().toLowerCase();

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
        });

        if (authError) {
            setMessage(`Error: El email no está registrado o la contraseña es incorrecta. Si es tu primera vez, ¡regístrate abajo!`);
            console.error(authError);
        } else {
            router.push("/");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Acceso Privado</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Identifícate para entrar en la cuadrilla
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-neutral-900 border-neutral-800 text-white h-12"
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-neutral-900 border-neutral-800 text-white h-12 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {message && (
                        <div className="text-sm text-center p-3 rounded-md bg-red-900/30 text-red-400">
                            {message}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-neutral-200"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>

                <p className="text-center text-sm text-neutral-400">
                    ¿No tienes cuenta? <Link href="/registro" className="text-white hover:underline">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}
