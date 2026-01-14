"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RecuperarPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const cleanEmail = email.trim().toLowerCase();

        // 1. Verificar si el email existe en la base de datos (whitelist)
        const { data: isAuthorized, error: rpcError } = await supabase
            .rpc("es_email_autorizado", { email_input: cleanEmail });

        if (rpcError || !isAuthorized) {
            setError("Este email no figura en nuestra base de datos de hermanos.");
            setLoading(false);
            return;
        }

        // 2. Si existe, enviar correo de recuperación
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            cleanEmail,
            {
                redirectTo: `${window.location.origin}/auth/callback?next=/nueva-contrasena`,
            }
        );

        if (resetError) {
            setError("Error al enviar el correo. Verifica tu email e inténtalo de nuevo.");
        } else {
            setSent(true);
        }

        setLoading(false);
    };

    if (sent) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Check className="text-emerald-500" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">¡Correo Enviado!</h2>
                        <p className="mt-4 text-sm text-neutral-400">
                            Hemos enviado un enlace de recuperación a <span className="text-white font-bold">{email}</span>.
                        </p>
                        <p className="mt-2 text-xs text-neutral-500">
                            Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para establecer una nueva contraseña.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Volver al login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Mail className="text-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Recuperar Contraseña</h2>
                    <p className="mt-2 text-sm text-neutral-400">
                        Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-neutral-900 border-neutral-800 text-white h-12"
                    />

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-neutral-200"
                    >
                        {loading ? "Enviando..." : "Enviar Enlace"}
                    </Button>
                </form>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
}
