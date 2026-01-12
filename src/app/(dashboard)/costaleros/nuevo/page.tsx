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
    email: z.string().email("Email inválido"),
    altura: z.string().optional(),
    trabajadera: z.string().regex(/^[1-7]$/, "Debe ser del 1 al 7"),
    puesto: z.string().min(2, "El puesto es obligatorio"),
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
            email: values.email.toLowerCase()
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
        <div className="max-w-2xl mx-auto p-6 space-y-8 bg-neutral-950 rounded-xl border border-neutral-800">
            <h2 className="text-2xl font-bold text-white">Alta de Costalero</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Nombre</label>
                        <Input {...register("nombre")} className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
                        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Apellidos</label>
                        <Input {...register("apellidos")} className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
                        {errors.apellidos && <p className="text-xs text-red-500">{errors.apellidos.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Email (Whitelist)</label>
                        <Input {...register("email")} type="email" className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Altura (m)</label>
                        <Input {...register("altura")} type="number" step="0.01" className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Trabajadera (1-7)</label>
                        <Input {...register("trabajadera")} type="number" min="1" max="7" className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
                        {errors.trabajadera && <p className="text-xs text-red-500">{errors.trabajadera.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Puesto</label>
                        <Input {...register("puesto")} placeholder="Patero, Costero..." className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500" />
                        {errors.puesto && <p className="text-xs text-red-500">{errors.puesto.message}</p>}
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-white text-black font-bold h-12">
                    {loading ? "Registrando..." : "Dar de Alta"}
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
