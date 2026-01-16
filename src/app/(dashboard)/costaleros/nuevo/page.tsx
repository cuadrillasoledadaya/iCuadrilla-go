"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

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
            setMessage("¡Costalero dado de alta con éxito!");
            reset();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8 bg-background min-h-screen pb-32">
            <header className="text-center space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Alta de Costalero</h1>
                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Nuevo Expediente</p>
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

            {qrValue && (
                <div className="flex flex-col items-center p-6 bg-white rounded-lg space-y-4">
                    <h3 className="text-black font-bold">Código QR del Costalero</h3>
                    <QRCodeSVG value={qrValue} size={200} />
                    <p className="text-black text-xs font-mono">{qrValue}</p>
                    <Button onClick={() => setQrValue(null)} className="bg-black text-white">Cerrar QR</Button>
                </div>
            )}
        </div>
    );
}
