"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AjustesPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setLoading(true);

        // Verify current password by re-authenticating
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            setMessage({ type: 'error', text: 'No se pudo obtener el usuario actual.' });
            setLoading(false);
            return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            setMessage({ type: 'error', text: 'La contraseña actual es incorrecta.' });
            setLoading(false);
            return;
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            setMessage({ type: 'error', text: `Error al actualizar: ${updateError.message}` });
        } else {
            setMessage({ type: 'success', text: '¡Contraseña actualizada con éxito!' });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }

        setLoading(false);
    };

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Ajustes</h1>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Configuración de Cuenta</p>
                </div>
            </header>

            {/* Password Change Form */}
            <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-neutral-900">Cambiar Contraseña</h2>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Seguridad de tu cuenta</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Contraseña Actual</label>
                        <div className="relative">
                            <Input
                                type={showPasswords ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="bg-neutral-50 border-black/5 h-14 rounded-2xl text-neutral-900 pr-12"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Nueva Contraseña</label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="bg-neutral-50 border-black/5 h-14 rounded-2xl text-neutral-900"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Confirmar Nueva Contraseña</label>
                        <Input
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="bg-neutral-50 border-black/5 h-14 rounded-2xl text-neutral-900"
                            placeholder="Repite la nueva contraseña"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                    </button>

                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            <span className="text-sm font-bold">{message.text}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        {loading ? "Actualizando..." : "Guardar Nueva Contraseña"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
