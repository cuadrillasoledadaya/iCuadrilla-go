"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserRole } from "@/hooks/useUserRole";
import { User, Ruler, MapPin, BadgeCheck, Mail } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getDisplayName } from "@/lib/utils";

export default function PerfilPage() {
    const { userId, isCostalero } = useUserRole();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from("costaleros")
                .select("*")
                .eq("user_id", userId)
                .single();

            if (data) setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-4 bg-neutral-100 rounded-full">
                    <User size={48} className="text-neutral-400" />
                </div>
                <h2 className="text-xl font-black text-neutral-900">Perfil no encontrado</h2>
                <p className="text-neutral-500">No hemos podido encontrar tus datos de costalero asociados a esta cuenta.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
            {/* Header */}
            <header className="text-center space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Mi Perfil</h1>
                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Ficha de Costalero</p>
            </header>

            {/* Main Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 border border-black/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />

                <div className="relative flex flex-col items-center text-center space-y-4">
                    {/* Avatar Placeholder */}
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary relative z-10">
                        <User size={48} />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-neutral-900 leading-none">
                            {getDisplayName(profile)}
                        </h2>
                        {profile.apodo && (
                            <p className="text-sm font-medium text-neutral-500">
                                {profile.nombre} {profile.apellidos}
                            </p>
                        )}
                        <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm font-medium pt-1">
                            <Mail size={14} />
                            <span>{profile.email}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-6">
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center gap-2">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                                <Ruler size={20} />
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-black text-neutral-900">{profile.altura || "-"}</span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Altura (m)</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center gap-2">
                            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                                <MapPin size={20} />
                            </div>
                            <div className="text-center">
                                <span className="block text-2xl font-black text-neutral-900">
                                    {profile.trabajadera ? `#${profile.trabajadera}` : "-"}
                                </span>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Trabajadera</span>
                            </div>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="pt-6 w-full flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-2xl border-2 border-black/5 shadow-sm">
                            {profile.qr_code ? (
                                <QRCodeSVG
                                    value={profile.qr_code}
                                    size={180}
                                    level="H"
                                    includeMargin
                                    className="rounded-lg"
                                />
                            ) : (
                                <div className="w-[180px] h-[180px] bg-neutral-100 rounded-lg flex items-center justify-center text-center p-4">
                                    <span className="text-xs text-neutral-400 font-bold">Código QR no disponible</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest text-center w-2/3">
                            Muestra este código al capataz para registrar tu asistencia
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
                <h3 className="px-2 text-xs font-black text-neutral-400 uppercase tracking-widest">Detalles Técnicos</h3>
                <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-black/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-500">
                                <BadgeCheck size={18} />
                            </div>
                            <span className="text-sm font-bold text-neutral-700">Puesto Habitual</span>
                        </div>
                        <span className="text-sm font-black text-neutral-900 uppercase">
                            {profile.puesto || "Sin asignar"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs text-center leading-relaxed">
                Esta es una vista de solo lectura. Si necesitas modificar algún dato personal,
                por favor contacta con el equipo de capataces o administradores.
            </div>
        </div>
    );
}
