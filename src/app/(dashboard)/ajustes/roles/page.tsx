"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ArrowLeft,
    Users,
    UserCog,
    Search,
    ShieldCheck,
    ShieldAlert,
    UserCircle
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    rol: string;
    puesto: string;
    email: string;
}

export default function RolesPage() {
    const router = useRouter();
    const { isMaster, loading: roleLoading, canManageRoles } = useUserRole();
    const [costaleros, setCostaleros] = useState<Costalero[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (!roleLoading && !canManageRoles) {
            router.push('/dashboard');
            return;
        }
        fetchCostaleros();
    }, [roleLoading, canManageRoles]);

    const fetchCostaleros = async () => {
        const { data, error } = await supabase
            .from("costaleros")
            .select("id, nombre, apellidos, rol, puesto, email")
            .neq("email", "proyectoszipi@gmail.com") // Excluir al superadmin por email
            .order("apellidos", { ascending: true });

        if (!error && data) {
            setCostaleros(data);
        }
        setLoading(false);
    };

    const handleRoleChange = async (id: string, newRole: string, nombre: string) => {
        const confirmChange = window.confirm(`¿Estás seguro de que deseas cambiar el rol de ${nombre} a ${newRole.toUpperCase()}?`);
        if (!confirmChange) return;

        setUpdatingId(id);
        const { error } = await supabase
            .from("costaleros")
            .update({ rol: newRole })
            .eq("id", id);

        if (!error) {
            setCostaleros(prev => prev.map(c => c.id === id ? { ...c, rol: newRole } : c));
        } else {
            alert("Error al actualizar el rol: " + error.message);
        }
        setUpdatingId(null);
    };

    const filteredCostaleros = costaleros.filter(c =>
        `${c.nombre} ${c.apellidos}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (roleLoading || loading) return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-[#FAFAFA] min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all active:scale-95 group/back z-10"
                >
                    <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
                        Gestión de Roles
                    </h1>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">SUPERADMIN PANEL</p>
                </div>
            </header>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Buscar costalero..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-12 pr-6 bg-white border border-black/5 rounded-[20px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <UserCog size={16} className="text-neutral-400" />
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        {filteredCostaleros.length} registrados
                    </p>
                </div>

                <div className="grid gap-3">
                    {filteredCostaleros.map((costalero) => (
                        <div
                            key={costalero.id}
                            className="bg-white p-5 rounded-[28px] border border-black/5 shadow-sm space-y-4 group hover:border-primary/20 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 rounded-2xl transition-colors",
                                        costalero.rol === 'capataz' ? "bg-primary/10 text-primary" :
                                            costalero.rol === 'auxiliar' ? "bg-amber-100 text-amber-600" :
                                                "bg-neutral-100 text-neutral-400"
                                    )}>
                                        {costalero.rol === 'capataz' ? <ShieldCheck size={24} /> :
                                            costalero.rol === 'auxiliar' ? <ShieldAlert size={24} /> :
                                                <UserCircle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 leading-tight">
                                            {costalero.nombre} {costalero.apellidos}
                                        </h3>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                            {costalero.puesto || 'Sin puesto'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    disabled={updatingId === costalero.id}
                                    onClick={() => handleRoleChange(costalero.id, 'costalero', `${costalero.nombre} ${costalero.apellidos}`)}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        costalero.rol === 'costalero'
                                            ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200"
                                            : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                    )}
                                >
                                    Costalero
                                </button>
                                <button
                                    disabled={updatingId === costalero.id}
                                    onClick={() => handleRoleChange(costalero.id, 'auxiliar', `${costalero.nombre} ${costalero.apellidos}`)}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        costalero.rol === 'auxiliar'
                                            ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                                            : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                    )}
                                >
                                    Auxiliar
                                </button>
                                <button
                                    disabled={updatingId === costalero.id}
                                    onClick={() => handleRoleChange(costalero.id, 'capataz', `${costalero.nombre} ${costalero.apellidos}`)}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        costalero.rol === 'capataz'
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                    )}
                                >
                                    Capataz
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
