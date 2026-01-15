"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function EditarAnuncio() {
    const router = useRouter();
    const params = useParams();
    const [anuncio, setAnuncio] = useState({ titulo: "", contenido: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchAnuncio = async () => {
            const { data, error } = await supabase
                .from("anuncios")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error) {
                alert("Error al cargar anuncio");
                router.push("/anuncios");
                return;
            }

            if (data) {
                setAnuncio({ titulo: data.titulo, contenido: data.contenido });
            }
            setLoading(false);
        };

        fetchAnuncio();
    }, [params.id, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from("anuncios")
            .update({ titulo: anuncio.titulo, contenido: anuncio.contenido })
            .eq("id", params.id);

        if (error) {
            alert("Error al guardar: " + error.message);
        } else {
            router.push("/anuncios");
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 bg-[#FAFAFA] min-h-screen">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Editar Anuncio</h1>
                </div>
            </header>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Título</label>
                    <Input
                        value={anuncio.titulo}
                        onChange={(e) => setAnuncio({ ...anuncio, titulo: e.target.value })}
                        className="h-14 bg-neutral-50 border-neutral-200 rounded-xl font-bold"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-500">Contenido</label>
                    <textarea
                        value={anuncio.contenido}
                        onChange={(e) => setAnuncio({ ...anuncio, contenido: e.target.value })}
                        className="w-full min-h-[150px] p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        required
                    />
                </div>

                <div className="pt-4">
                    <Button
                        disabled={saving}
                        className="w-full h-14 rounded-2xl bg-neutral-900 text-white font-black uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
                    >
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
