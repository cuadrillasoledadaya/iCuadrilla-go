"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, UserPlus, List, X, ExternalLink, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    nombre: z.string().min(2, "El nombre es obligatorio"),
    apellidos: z.string().min(2, "Los apellidos son obligatorios"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    altura: z.string().optional(),
    trabajadera: z.string().regex(/^[1-7]$/, "Debe ser del 1 al 7"),
    puesto: z.string().min(2, "El puesto es obligatorio"),
    suplemento: z.string().optional(),
    ano_ingreso: z.string().optional(),
});

export default function AltaCostalero() {
    const [loading, setLoading] = useState(false);
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [newCostaleroName, setNewCostaleroName] = useState("");

    const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        setMessage("");

        // Generar un código QR aleatorio
        const qrCode = `${values.nombre.toLowerCase()}-${Math.random().toString(36).substring(7)}`;

        const { error } = await supabase.from("costaleros").insert([{
            ...values,
            altura: values.altura ? parseFloat(values.altura) : null,
            trabajadera: parseInt(values.trabajadera),
            qr_code: qrCode,
            email: values.email ? values.email.toLowerCase() : null,
            suplemento: values.suplemento ? parseFloat(values.suplemento) : null,
            ano_ingreso: values.ano_ingreso ? parseInt(values.ano_ingreso) : null,
        }]);

        if (error) {
            console.error(error);
            setMessage(`Error: ${error.message}`);
        } else {
            setQrValue(qrCode);
            setNewCostaleroName(`${values.nombre} ${values.apellidos}`);
            setShowSuccessModal(true);
            reset();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8 bg-background min-h-screen pb-32">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <Link
                    href="/cuadrilla"
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 z-10"
                >
                    <ChevronLeft size={24} />
                </Link>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Alta de Costalero</h1>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Nuevo Expediente</p>
                </div>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Nombre</label>
                        <Input {...register("nombre")} className="bg-white border-black/10 text-neutral-900 placeholder:text-neutral-400 h-12 rounded-xl" />
                        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Apellidos</label>
                        <Input {...register("apellidos")} className="bg-white border-black/10 text-neutral-900 placeholder:text-neutral-400 h-12 rounded-xl" />
                        {errors.apellidos && <p className="text-xs text-red-500">{errors.apellidos.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Email (Opcional)</label>
                        <Input {...register("email")} type="email" className="bg-white border-black/10 text-neutral-900 placeholder:text-neutral-400 h-12 rounded-xl" />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Altura (m)</label>
                        <Input {...register("altura")} type="number" step="0.01" className="bg-white border-black/10 text-neutral-900 placeholder:text-neutral-400 h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Trabajadera (1-7)</label>
                        <select {...register("trabajadera")} className="w-full bg-white border border-black/10 h-12 rounded-xl px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            <option value="" className="text-black bg-white">Selecciona...</option>
                            {Array.from({ length: 7 }, (_, i) => i + 1).map((val) => (
                                <option key={val} value={val} className="text-black bg-white">Trabajadera {val}</option>
                            ))}
                        </select>
                        {errors.trabajadera && <p className="text-xs text-red-500">{errors.trabajadera.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Puesto</label>
                        <select {...register("puesto")} className="w-full bg-white border border-black/10 h-12 rounded-xl px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            <option value="" className="text-black bg-white">Selecciona...</option>
                            <option value="Patero Izq" className="text-black bg-white">Patero Izq</option>
                            <option value="Patero Der" className="text-black bg-white">Patero Der</option>
                            <option value="Fijador Izq" className="text-black bg-white">Fijador Izq</option>
                            <option value="Fijador Der" className="text-black bg-white">Fijador Der</option>
                            <option value="Costero Izq" className="text-black bg-white">Costero Izq</option>
                            <option value="Costero Der" className="text-black bg-white">Costero Der</option>
                            <option value="Corriente" className="text-black bg-white">Corriente</option>
                        </select>
                        {errors.puesto && <p className="text-xs text-red-500">{errors.puesto.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Suplemento (cm)</label>
                        <select {...register("suplemento")} className="w-full bg-white border border-black/10 h-12 rounded-xl px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            <option value="" className="text-black bg-white">Sin suplemento</option>
                            {Array.from({ length: 12 }, (_, i) => (0.5 * (i + 1)).toFixed(1)).map((val) => (
                                <option key={val} value={val} className="text-black bg-white">{val} cm</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Año de Ingreso</label>
                        <Input {...register("ano_ingreso")} type="number" className="bg-white border-black/10 text-neutral-900 placeholder:text-neutral-400 h-12 rounded-xl" placeholder="Ej. 2024" />
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-primary text-white font-black h-14 rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-widest text-xs">
                    {loading ? "Registrando..." : "DAR DE ALTA COSTALERO"}
                </Button>
            </form>

            {message && <p className={`text-center font-medium ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>{message}</p>}

            {/* Modal de Éxito Premium */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-6 right-6 p-2 text-neutral-300 hover:text-neutral-900 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 pt-12 text-center space-y-6">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                                <div className="relative w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 rotate-3">
                                    <CheckCircle2 size={40} className="text-white -rotate-3" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-neutral-900">¡Alta Completada!</h3>
                                <p className="text-sm text-neutral-500 font-medium">
                                    <span className="text-primary font-bold">{newCostaleroName}</span> ya forma parte oficial de la cuadrilla.
                                </p>
                            </div>

                            {qrValue && (
                                <div className="bg-neutral-50 p-4 rounded-3xl border border-black/5 space-y-3">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm inline-block">
                                        <QRCodeSVG value={qrValue} size={120} />
                                    </div>
                                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{qrValue}</p>
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full bg-primary text-white font-black h-14 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all active:scale-95"
                                >
                                    <UserPlus size={18} />
                                    <span>DAR OTRA ALTA</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <Link href="/cuadrilla" className="block w-full">
                                    <button className="w-full bg-white border border-black/5 text-neutral-900 font-black h-14 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all active:scale-95">
                                        <ExternalLink size={18} className="text-neutral-400" />
                                        <span>VER LISTADO</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
