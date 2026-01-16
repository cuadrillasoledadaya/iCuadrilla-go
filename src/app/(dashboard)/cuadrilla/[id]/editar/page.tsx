"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, Trash2 } from "lucide-react";

const formSchema = z.object({
    nombre: z.string().min(2, "El nombre es obligatorio"),
    apellidos: z.string().min(2, "Los apellidos son obligatorios"),
    email: z.string().email("Email inválido"),
    altura: z.string().optional(),
    trabajadera: z.string().regex(/^[1-7]$/, "Debe ser del 1 al 7"),
    puesto: z.string().min(2, "El puesto es obligatorio"),
    suplemento: z.string().optional(),
    ano_ingreso: z.string().optional(),
});

export default function EditarCostalero() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        const fetchCostalero = async () => {
            const { data } = await supabase
                .from("costaleros")
                .select("*")
                .eq("id", params.id)
                .single();

            if (data) {
                reset({
                    ...data,
                    altura: data.altura?.toString(),
                    trabajadera: data.trabajadera?.toString(),
                    suplemento: data.suplemento?.toString(),
                    ano_ingreso: data.ano_ingreso?.toString(),
                });
            }
            setLoading(false);
        };
        fetchCostalero();
    }, [params.id, reset]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setSaving(true);
        setMessage("");

        const { error } = await supabase
            .from("costaleros")
            .update({
                ...values,
                altura: values.altura ? parseFloat(values.altura) : null,
                trabajadera: parseInt(values.trabajadera),
                email: values.email.toLowerCase(),
                suplemento: values.suplemento ? parseFloat(values.suplemento) : null,
                ano_ingreso: values.ano_ingreso ? parseInt(values.ano_ingreso) : null,
            })
            .eq("id", params.id);

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage("¡Datos actualizados con éxito!");
            setTimeout(() => router.push("/cuadrilla"), 1500);
        }
        setSaving(false);
    };

    const deleteCostalero = async () => {
        if (!confirm("¿Estás seguro de que deseas eliminar este costalero? Esta acción no se puede deshacer.")) return;

        setSaving(true);
        const { error } = await supabase
            .from("costaleros")
            .delete()
            .eq("id", params.id);

        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            router.push("/cuadrilla");
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 max-w-2xl mx-auto">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white border border-black/5 rounded-2xl text-neutral-400 hover:text-primary transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black tracking-tight uppercase text-neutral-900">Editar Datos</h1>
                    <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">Actualización de Expediente</p>
                </div>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 space-y-6 rounded-[2rem] border border-black/5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Nombre</label>
                        <Input {...register("nombre")} className="bg-white border-black/10 h-12 rounded-xl text-neutral-900 placeholder:text-neutral-400" />
                        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Apellidos</label>
                        <Input {...register("apellidos")} className="bg-white border-black/10 h-12 rounded-xl text-neutral-900 placeholder:text-neutral-400" />
                        {errors.apellidos && <p className="text-xs text-red-500">{errors.apellidos.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Email</label>
                        <Input {...register("email")} type="email" className="bg-white border-black/10 h-12 rounded-xl text-neutral-900 placeholder:text-neutral-400" />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Altura (m)</label>
                        <Input {...register("altura")} type="number" step="0.01" className="bg-white border-black/10 h-12 rounded-xl text-neutral-900 placeholder:text-neutral-400" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Trabajadera (1-7)</label>
                        <select {...register("trabajadera")} className="w-full bg-white border border-black/10 h-12 rounded-xl px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            {Array.from({ length: 7 }, (_, i) => i + 1).map((val) => (
                                <option key={val} value={val} className="text-black bg-white">Trabajadera {val}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Puesto</label>
                        <select {...register("puesto")} className="w-full bg-white border border-black/10 h-12 rounded-xl px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            <option value="Patero Izq" className="text-black bg-white">Patero Izq</option>
                            <option value="Patero Der" className="text-black bg-white">Patero Der</option>
                            <option value="Fijador Izq" className="text-black bg-white">Fijador Izq</option>
                            <option value="Fijador Der" className="text-black bg-white">Fijador Der</option>
                            <option value="Costero Izq" className="text-black bg-white">Costero Izq</option>
                            <option value="Costero Der" className="text-black bg-white">Costero Der</option>
                            <option value="Corriente" className="text-black bg-white">Corriente</option>
                        </select>
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
                        <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Año de Ingreso</label>
                        <Input {...register("ano_ingreso")} type="number" className="bg-white border-black/10 h-12 rounded-xl text-neutral-900 placeholder:text-neutral-400" placeholder="Ej. 2018" />
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-white font-black h-14 rounded-2xl gap-2 shadow-lg shadow-primary/20 tracking-widest text-xs">
                        <Save size={20} />
                        {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                    </Button>

                    <Button
                        type="button"
                        onClick={deleteCostalero}
                        disabled={saving}
                        className="w-full bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600/20 font-bold h-14 rounded-2xl gap-2"
                    >
                        <Trash2 size={18} />
                        ELIMINAR COSTALERO
                    </Button>
                </div>
            </form>

            {message && (
                <div className={cn(
                    "p-4 rounded-2xl text-center font-bold animate-in fade-in zoom-in-95 duration-300",
                    message.includes("Error") ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                )}>
                    {message}
                </div>
            )}
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
