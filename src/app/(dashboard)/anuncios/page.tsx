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
        <div className="p-6 space-y-8 bg-background min-h-screen pb-32 animate-in fade-in duration-700">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 group/back"
                >
                    <ChevronLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Tablón de Anuncios</h1>
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Comunicados Oficiales</p>
                </div>
            </header>

            {canManageAnnouncements && (
                <form onSubmit={publicar} className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200 opacity-50"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-neutral-100 rounded-xl text-neutral-600">
                            <Pencil size={18} />
                        </div>
                        <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">Nuevo Comunicado</h3>
                    </div>

                    <div className="space-y-3">
                        <Input
                            placeholder="Título del anuncio..."
                            value={nuevo.titulo}
                            onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
                            className="h-12 bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 font-bold focus:ring-neutral-200 focus:border-neutral-300 rounded-xl"
                            required
                        />
                        <textarea
                            placeholder="Escribe el contenido aquí..."
                            value={nuevo.contenido}
                            onChange={(e) => setNuevo({ ...nuevo, contenido: e.target.value })}
                            className="w-full min-h-[120px] p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 focus:border-neutral-300 resize-none transition-all"
                            required
                        />
                    </div>

                    <Button disabled={loading} className="w-full h-12 bg-neutral-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:shadow-neutral-300/50 transition-all active:scale-[0.98]">
                        {loading ? "Publicando..." : "Publicar Anuncio"}
                    </Button>
                </form>
            )}

            <div className="space-y-4">
                {anuncios.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <div className="inline-flex p-4 rounded-full bg-neutral-100 text-neutral-400 mb-3">
                            <Bell size={24} />
                        </div>
                        <p className="text-sm font-medium text-neutral-400">No hay anuncios publicados</p>
                    </div>
                ) : (
                    anuncios.map(a => (
                        <div key={a.id} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm space-y-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                            <div className="absolute top-0 left-0 w-1 h-full bg-black/5 group-hover:bg-neutral-900 transition-colors duration-300"></div>

                            <div className="flex items-start justify-between gap-4 pl-2">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-neutral-50 text-neutral-900 border border-black/5">
                                            <Bell size={16} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-lg text-neutral-900 leading-tight uppercase tracking-tight">{a.titulo}</h3>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mt-0.5">
                                                {new Date(a.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pl-[52px]">
                                        <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap font-medium">{a.contenido}</p>
                                    </div>
                                </div>

                                {canManageAnnouncements && (
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
