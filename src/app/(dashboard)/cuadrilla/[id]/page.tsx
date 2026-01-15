"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft,
    QrCode as QrIcon,
    Ruler,
    Mail,
    User,
    Shield,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <div className="flex min-h-screen items-center justify-center bg-neutral-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    if (!costalero) return (
        <div className="p-6 text-center space-y-4 min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
            <p className="text-neutral-500 font-bold uppercase tracking-widest">No se ha encontrado el costalero.</p>
            <Button onClick={() => router.back()} className="bg-primary text-white font-bold">Volver</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 pb-32 animate-in fade-in duration-700">
            {/* Header */}
            <header className="relative p-6 flex items-center justify-center">
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 p-3 bg-neutral-900/50 border border-white/5 rounded-2xl text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-1">
                    <h1 className="text-lg font-black tracking-tight uppercase text-white tracking-[0.2em] text-shadow-sm">Ficha del Hermano</h1>
                </div>
                <button
                    onClick={() => router.push(`/cuadrilla/${costalero.id}/editar`)}
                    className="absolute right-6 p-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary hover:bg-primary/20 transition-colors"
                >
                    <ArrowUpRight size={24} />
                </button>
            </header>

            <main className="px-6 space-y-6">
                {/* Profile Card */}
                <div className="relative overflow-hidden bg-neutral-900 border border-white/5 p-8 rounded-[32px] shadow-2xl space-y-6 text-center group">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
                        <User size={200} />
                    </div>

                    <div className="relative flex justify-center">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-primary text-5xl font-black border-2 border-primary/20 shadow-[0_0_40px_rgba(234,179,8,0.1)] group-hover:scale-105 transition-transform duration-500">
                            {costalero.nombre[0]}{costalero.apellidos[0]}
                        </div>
                        <div className="absolute -bottom-3 px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border-2 border-neutral-900">
                            Trabajadera {costalero.trabajadera}
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">
                            {costalero.nombre} <span className="text-neutral-500">{costalero.apellidos}</span>
                        </h2>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <Shield size={12} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                {costalero.puesto}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900/50 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-neutral-900/80 transition-colors group">
                        <div className="p-2.5 bg-neutral-800/50 rounded-xl text-neutral-400 group-hover:text-primary transition-colors">
                            <Ruler size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Altura</p>
                            <p className="text-xl font-black text-white">{costalero.altura} <span className="text-xs text-neutral-600 font-bold">m</span></p>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-neutral-900/80 transition-colors group">
                        <div className="p-2.5 bg-neutral-800/50 rounded-xl text-neutral-400 group-hover:text-primary transition-colors">
                            <ArrowUpRight size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Suplemento</p>
                            <p className="text-xl font-black text-white">
                                {costalero.suplemento ? `${costalero.suplemento}` : '--'} <span className="text-xs text-neutral-600 font-bold">cm</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-neutral-900/80 transition-colors group">
                        <div className="p-2.5 bg-neutral-800/50 rounded-xl text-neutral-400 group-hover:text-primary transition-colors">
                            <Calendar size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Año Ingreso</p>
                            <p className="text-xl font-black text-white">{costalero.ano_ingreso || '----'}</p>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 p-5 rounded-[24px] border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-neutral-900/80 transition-colors group cursor-pointer" onClick={() => window.open(`mailto:${costalero.email}`)}>
                        <div className="p-2.5 bg-neutral-800/50 rounded-xl text-neutral-400 group-hover:text-primary transition-colors">
                            <Mail size={20} />
                        </div>
                        <div className="text-center w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Contacto</p>
                            <p className="text-xs font-bold text-white truncate px-2">{costalero.email}</p>
                        </div>
                    </div>
                </div>

                {/* Identity Card (QR) */}
                <div className="bg-gradient-to-br from-neutral-900 to-black p-1 rounded-[32px] border border-white/5 shadow-2xl">
                    <div className="bg-neutral-950 rounded-[28px] p-6 text-center space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2 text-primary mb-2">
                                <QrIcon size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identificación Digital</span>
                            </div>
                            <h3 className="text-white font-black text-lg">Acceso a Casa Hermandad</h3>
                        </div>

                        <div className="flex justify-center">
                            <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <QRCodeSVG value={costalero.qr_code} size={160} />
                            </div>
                        </div>

                        <div className="bg-neutral-900/50 rounded-xl p-3 border border-white/5">
                            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">ID Code</p>
                            <p className="text-xs font-bold text-primary tracking-widest">{costalero.qr_code}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
