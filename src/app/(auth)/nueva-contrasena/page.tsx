"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevaContrasenaPage() {
    // const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Check if user has a valid session (from recovery link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setSessionReady(true);
            } else {
                setError("Enlace inválido o expirado. Solicita uno nuevo.");
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            setError(`Error al actualizar: ${updateError.message}`);
        } else {
            setSuccess(true);
            // Sign out after password change so user logs in fresh
            await supabase.auth.signOut();
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Check className="text-emerald-500" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">¡Contraseña Actualizada!</h2>
                        <p className="mt-4 text-sm text-neutral-400">
                            Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-block w-full"
                    >
                        <Button className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-neutral-200">
                            Ir al Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!sessionReady && !error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
            </div>
        );
    }

    if (error && !sessionReady) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
                <div className="w-full max-w-sm space-y-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Enlace Inválido</h2>
                        <p className="mt-4 text-sm text-neutral-400">
                            El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.
                        </p>
                    </div>
                    <Link
                        href="/recuperar"
                        className="inline-block w-full"
                    >
                        <Button className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-neutral-200">
                            Solicitar Nuevo Enlace
                        </Button>
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
                        <Lock className="text-primary" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Nueva Contraseña</h2>
                    <p className="mt-2 text-sm text-neutral-400">
                        Introduce tu nueva contraseña para acceder a tu cuenta.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type={showPasswords ? "text" : "password"}
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="bg-neutral-900 border-neutral-800 text-white h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            type={showPasswords ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="bg-neutral-900 border-neutral-800 text-white h-12"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPasswords ? "Ocultar" : "Mostrar"}
                    </button>

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
                        {loading ? "Guardando..." : "Establecer Contraseña"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
