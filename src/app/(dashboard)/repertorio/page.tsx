"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    Plus,
    FileText,
    ExternalLink,
    Trash2,
    X,
    Upload,
    ArrowLeft,
    Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface Repertorio {
    id: string;
    nombre: string;
    temporada_id: string;
    archivo_path: string;
    created_at: string;
}

interface Temporada {
    id: string;
    nombre: string;
    activa: boolean;
}

export default function RepertorioPage() {
    const router = useRouter();
    const { isAdmin, isMaster, loading: roleLoading } = useUserRole();
    const [repertorios, setRepertorios] = useState<Repertorio[]>([]);
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [selectedTemporada, setSelectedTemporada] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Form states
    const [uploading, setUploading] = useState(false);
    const [newNombre, setNewNombre] = useState("");
    const [newTemporadaId, setNewTemporadaId] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchRepertorios = async () => {
        try {
            const { data } = await supabase
                .from("repertorios")
                .select("*")
                .order("created_at", { ascending: false });
            if (data) setRepertorios(data);
        } catch (e) {
            console.error("Error fetching repertoires:", e);
        }
    };

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Seasons
            const { data: tempRows } = await supabase
                .from("temporadas")
                .select("*")
                .order("nombre", { ascending: false });

            if (tempRows) {
                setTemporadas(tempRows);
                const active = tempRows.find(t => t.activa);
                if (active) setSelectedTemporada(active.id);
                else if (tempRows.length > 0) setSelectedTemporada(tempRows[0].id);
            }

            // Fetch Repertoires
            await fetchRepertorios();
        } catch (e) {
            console.error("Error fetching initial data:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleUpload = async () => {
        if (!selectedFile || !newNombre || !newTemporadaId) {
            alert("Por favor rellena todos los campos.");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload file to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `repertorios/${newTemporadaId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('repertorios')
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            // 2. Insert metadata into DB
            const { error: dbError } = await supabase
                .from('repertorios')
                .insert({
                    nombre: newNombre,
                    temporada_id: newTemporadaId,
                    archivo_path: filePath
                });

            if (dbError) throw dbError;

            alert("Repertorio subido correctamente.");
            setShowUploadModal(false);
            setNewNombre("");
            setSelectedFile(null);
            await fetchRepertorios();
        } catch (e: unknown) {
            console.error("Error uploading:", e);
            alert("Error al subir: " + (e as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (rep: Repertorio) => {
        if (!confirm(`¿Borrar el repertorio "${rep.nombre}"?`)) return;

        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('repertorios')
                .remove([rep.archivo_path]);

            if (storageError) console.error("Could not delete from storage:", storageError);

            // Delete from DB
            const { error: dbError } = await supabase
                .from('repertorios')
                .delete()
                .eq('id', rep.id);

            if (dbError) throw dbError;

            setRepertorios(prev => prev.filter(r => r.id !== rep.id));
        } catch (e: unknown) {
            alert("Error al borrar: " + (e as Error).message);
        }
    };

    const getFileUrl = (path: string) => {
        const { data } = supabase.storage.from('repertorios').getPublicUrl(path);
        return data.publicUrl;
    };

    const filteredRepertorios = repertorios.filter(r => r.temporada_id === selectedTemporada);

    if (roleLoading && loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white border border-black/5 rounded-full hover:bg-neutral-100 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-neutral-600" />
                    </button>
                    <h1 className="text-lg font-black uppercase tracking-tight text-neutral-900">Repertorio Musical</h1>
                </div>

                {(isAdmin || isMaster) && (
                    <button
                        onClick={() => {
                            setNewTemporadaId(selectedTemporada);
                            setShowUploadModal(true);
                        }}
                        className="p-3 bg-neutral-900 text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                )}
            </header>

            <div className="p-6 space-y-8">
                {/* Selector de Temporadas */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
                    {temporadas.map(temp => (
                        <button
                            key={temp.id}
                            onClick={() => setSelectedTemporada(temp.id)}
                            className={cn(
                                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 shadow-sm",
                                selectedTemporada === temp.id
                                    ? "bg-primary border-primary text-white scale-105"
                                    : "bg-white border-black/5 text-neutral-400 hover:border-black/10"
                            )}
                        >
                            {temp.nombre}
                        </button>
                    ))}
                </div>

                {/* Lista de Repertorios */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Documentos Disponibles</h3>
                    </div>

                    {filteredRepertorios.length === 0 ? (
                        <div className="bg-white/50 p-12 rounded-[40px] border border-black/5 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-primary/5 rounded-full text-primary/20">
                                <Music size={40} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Sin repertorio</p>
                                <p className="text-neutral-300 text-xs italic">Aun no se ha subido ningún archivo para esta temporada</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredRepertorios.map(rep => (
                                <div
                                    key={rep.id}
                                    className="bg-white p-5 rounded-[32px] border border-black/5 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-tight truncate italic">
                                                {rep.nombre}
                                            </h4>
                                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                {new Date(rep.created_at).toLocaleDateString()}
                                                <span>•</span>
                                                PDF/Doc
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <a
                                            href={getFileUrl(rep.archivo_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-neutral-50 text-neutral-400 rounded-xl hover:bg-neutral-900 hover:text-white transition-all shadow-sm"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        {(isAdmin || isMaster) && (
                                            <button
                                                onClick={() => handleDelete(rep)}
                                                className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100/50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Subida */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowUploadModal(false)}>
                    <div className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-8 shadow-2xl animate-in zoom-in-95 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center pr-2">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter italic">Subir Repertorio</h3>
                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Gestión de Documentación</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors">
                                <X size={20} className="text-neutral-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nombre del archivo</label>
                                <Input
                                    placeholder="Ej: Salida Ordinaria, Traslado..."
                                    value={newNombre}
                                    onChange={e => setNewNombre(e.target.value)}
                                    className="h-14 rounded-2xl bg-neutral-50 border-black/5 font-bold uppercase tracking-tight italic"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Temporada</label>
                                <select
                                    value={newTemporadaId}
                                    onChange={e => setNewTemporadaId(e.target.value)}
                                    className="w-full h-14 rounded-2xl bg-neutral-50 border border-black/5 px-4 font-bold uppercase tracking-tight outline-none focus:ring-2 focus:ring-primary/20 appearance-none italic"
                                >
                                    {temporadas.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Archivo (PDF o Word)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={cn(
                                            "w-full h-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                            selectedFile
                                                ? "border-emerald-500 bg-emerald-50/50 text-emerald-600"
                                                : "border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-primary/30"
                                        )}
                                    >
                                        <Upload size={24} />
                                        <span className="text-xs font-bold uppercase tracking-wider truncate px-6 max-w-full">
                                            {selectedFile ? selectedFile.name : "Seleccionar Archivo"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || !newNombre || !newTemporadaId || uploading}
                                className="w-full h-16 rounded-[24px] bg-neutral-900 text-white font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {uploading ? "Subiendo..." : "Confirmar Subida"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
