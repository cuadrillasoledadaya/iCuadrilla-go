"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    QrCode as QrIcon,
    Calendar,
    Ruler,
    User,
    Users,
    Mail,
    Shield
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useRouter } from "next/navigation";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    altura: number;
    trabajadera: number;
    puesto: string;
    suplemento?: number;
    ano_ingreso?: number;
    qr_code: string;
}

export default function FichaCostalero() {
    const params = useParams();
    const router = useRouter();
    const [costalero, setCostalero] = useState<Costalero | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCostalero = async () => {
            const { data } = await supabase
                .from("costaleros")
                .select("*")
                .eq("id", params.id)
                .single();

            if (data) setCostalero(data);
            setLoading(false);
        };
        fetchCostalero();
    }, [params.id]);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
        </div>
    );

    if (!costalero) return (
        <div className="p-6 text-center space-y-4">
            <p className="text-neutral-500">No se ha encontrado el costalero.</p>
            <Button onClick={() => router.back()}>Volver</Button>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white/5 border border-white/10 rounded-2xl text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tight uppercase text-white">Ficha del Hermano</h1>
                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Información Detallada</p>
                </div>
            </header>

            {/* Perfil Card */}
            <div className="glass-card p-8 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Users size={120} />
                </div>

                <div className="h-24 w-24 rounded-3xl bg-primary/20 flex items-center justify-center text-accent text-4xl font-black border border-accent/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                    {costalero.nombre[0]}{costalero.apellidos[0]}
                </div>

                <div>
                    <h2 className="text-2xl font-black text-white">{costalero.nombre} {costalero.apellidos}</h2>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/10">
                            {costalero.puesto}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-neutral-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                            Trabajadera {costalero.trabajadera}
                        </span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-neutral-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <Ruler className="text-neutral-500" size={18} />
                        <span className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">Altura</span>
                        <span className="text-lg font-black">{costalero.altura || '---'} m</span>
                    </div>
                    <div className="bg-neutral-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <Mail className="text-neutral-500" size={18} />
                        <span className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">Contacto</span>
                        <span className="text-[10px] font-bold text-neutral-300 truncate w-full">{costalero.email}</span>
                    </div>
                    <div className="bg-neutral-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <span className="text-neutral-500 text-[10px] font-bold">SUPLEMENTO</span>
                        <span className="text-lg font-black text-white">{costalero.suplemento ? `${costalero.suplemento} cm` : '---'}</span>
                    </div>
                    <div className="bg-neutral-950/50 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <span className="text-neutral-500 text-[10px] font-bold">AÑO INGRESO</span>
                        <span className="text-lg font-black text-white">{costalero.ano_ingreso || '---'}</span>
                    </div>
                </div>
            </div>

            {/* QR Code Section */}
            <div className="glass-card p-8 flex flex-col items-center space-y-6">
                <div className="flex items-center gap-2 text-accent">
                    <QrIcon size={20} />
                    <h3 className="font-black uppercase tracking-widest text-xs">Código de Identificación</h3>
                </div>

                <div className="p-4 bg-white rounded-3xl shadow-2xl">
                    <QRCodeSVG value={costalero.qr_code} size={180} />
                </div>

                <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                    Digital ID: {costalero.qr_code}
                </p>

                <Button className="w-full glass bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-2xl font-bold">
                    Descargar Ficha PDF
                </Button>
            </div>
        </div>
    );
}
