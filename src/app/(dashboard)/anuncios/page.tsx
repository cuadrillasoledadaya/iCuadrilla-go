"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function TablonAnuncios() {
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

    const { isCostalero } = useUserRole();

    return (
        <div className="p-6 space-y-8 bg-[#FAFAFA] min-h-screen pb-32">
            <header className="text-center space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Tablón de Anuncios</h1>
                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Comunicados Oficiales</p>
            </header>

            {!isCostalero && (
                <form onSubmit={publicar} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
                    <Input
                        placeholder="Título del anuncio"
                        value={nuevo.titulo}
                        onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
                        className="bg-neutral-950 border-neutral-800"
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
                    <div key={a.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2 relative overflow-hidden">
                        <div className="flex items-center gap-2">
                            <Bell size={14} className="text-neutral-500" />
                            <h3 className="font-bold text-white">{a.titulo}</h3>
                        </div>
                        <p className="text-sm text-neutral-400">{a.contenido}</p>
                        <p className="text-[10px] text-neutral-600 uppercase">
                            {new Date(a.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
