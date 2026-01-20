"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Pencil, Trash2, ChevronLeft } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";

export default function TablonAnuncios() {
    const router = useRouter();
    const [anuncios, setAnuncios] = useState<any[]>([]);
    const [nuevo, setNuevo] = useState({ titulo: "", contenido: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAnuncios();
    }, []);

    const fetchAnuncios = async () => {
        const { data } = await supabase.from("anuncios").select("*").order("created_at", { ascending: false });
        if (data) setAnuncios(data);
    };

    const publicar = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from("anuncios").insert([nuevo]);
        if (!error) {
            setNuevo({ titulo: "", contenido: "" });
            fetchAnuncios();
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas borrar este anuncio?")) return;

        const { error } = await supabase.from("anuncios").delete().eq("id", id);
        if (error) {
            alert("Error al borrar: " + error.message);
        } else {
            fetchAnuncios();
        }
    };

    const { isCostalero, canManageAnnouncements } = useUserRole();

    return (
        <div className="p-6 space-y-8 bg-background min-h-screen pb-32">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Tablón de Anuncios</h1>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Comunicados Oficiales</p>
                </div>
            </header>

            {canManageAnnouncements && (
                <form onSubmit={publicar} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
                    <Input
                        placeholder="Título del anuncio"
                        value={nuevo.titulo}
                        onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
                        className="bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-400"
                        required
                    />
                    <textarea
                        placeholder="Contenido..."
                        value={nuevo.contenido}
                        onChange={(e) => setNuevo({ ...nuevo, contenido: e.target.value })}
                        className="w-full min-h-[100px] p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        required
                    />
                    <Button disabled={loading} className="w-full bg-white text-black font-bold">
                        {loading ? "Publicando..." : "Publicar Anuncio"}
                    </Button>
                </form>
            )}

            <div className="space-y-4">
                {anuncios.map(a => (
                    <div key={a.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2 relative overflow-hidden group">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-neutral-500 shrink-0" />
                                    <h3 className="font-bold text-white break-words">{a.titulo}</h3>
                                </div>
                                <p className="text-sm text-neutral-400 whitespace-pre-wrap">{a.contenido}</p>
                                <p className="text-[10px] text-neutral-600 uppercase pt-2">
                                    {new Date(a.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {canManageAnnouncements && (
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => router.push(`/anuncios/${a.id}/editar`)}
                                        className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-700 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
