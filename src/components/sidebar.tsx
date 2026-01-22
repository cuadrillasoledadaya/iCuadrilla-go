"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Bell,
    Calendar,
    PlusCircle,
    Users,
    Database,
    Download,
    Settings,
    LogOut,
    ChevronDown,
    X,
    Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [temporadasList, setTemporadasList] = useState<any[]>([]);
    const [activeSeason, setActiveSeason] = useState<any | null>(null);
    const [seasonsOpen, setSeasonsOpen] = useState(false);
    const [loadingSeasons, setLoadingSeasons] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserEmail(user.email || null);
        };
        getUser();
        fetchSeasons();
    }, []);

    const fetchSeasons = async () => {
        setLoadingSeasons(true);
        const { data } = await supabase.from("temporadas").select("*").order("created_at", { ascending: false });
        if (data) {
            setTemporadasList(data);
            const active = data.find((t: any) => t.activa);
            setActiveSeason(active || null);
        }
        setLoadingSeasons(false);
    };

    const handleSwitchSeason = async (season: any) => {
        if (season.activa) {
            setSeasonsOpen(false);
            return;
        }

        if (confirm(`¿Cambiar a la temporada ${season.nombre}?`)) {
            // Desactivar todas
            await supabase.from("temporadas").update({ activa: false }).neq("id", "00000000-0000-0000-0000-000000000000");
            // Activar seleccionada
            await supabase.from("temporadas").update({ activa: true }).eq("id", season.id);

            // Recargar para que toda la app se entere
            window.location.reload();
        }
    };

    const { isCostalero, isAdmin, canManageSeasons, canManageRoles, loading: roleLoading } = useUserRole();

    const menuGroups = [
        {
            items: [
                { label: "Inicio", href: "/dashboard", icon: Home },
                // Mostrar "Mi Perfil" solo para costaleros
                ...(isCostalero ? [{ label: "Mi Perfil", href: "/perfil", icon: Users }] : []),
                { label: "Tablón de Anuncios", href: "/anuncios", icon: Bell },
                { label: "Calendario de Eventos", href: "/eventos", icon: Calendar },
                { label: "Notificaciones", href: "/notificaciones", icon: Bell },
                // Ocultar ajustes para costaleros puros
                ...(isAdmin ? [{ label: "Ajustes", href: "/ajustes", icon: Lock }] : []),
            ]
        },
        // Mostrar grupo de gestión para admins
        ...(isAdmin ? [{
            title: "GESTIÓN",
            items: [
                { label: "Nuevo Evento", href: "/eventos/nuevo", icon: PlusCircle },
                { label: "Cuadrilla", href: "/cuadrilla", icon: Users },
                { label: "Datos Palio", href: "/datos-palio", icon: Database },
                { label: "Exportar Datos", href: "/exportar", icon: Download },
                { label: "Configurar Temporada", href: "/temporadas", icon: Settings },
                ...(canManageRoles ? [{ label: "Gestión de Roles", href: "/ajustes/roles", icon: Users }] : []),
            ]
        }] : [])
    ];

    const handleSignOut = async () => {
        onClose(); // Cerrar el sidebar primero
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 sm:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Side Drawer */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 w-[85%] max-w-[300px] bg-white z-[70] transition-transform duration-300 ease-out border-r border-black/5 flex flex-col pt-4 shadow-2xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header Side */}
                <div className="px-6 py-8 flex flex-col items-center text-center space-y-3 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-4 p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-accent/20">
                        <Calendar className="text-primary" size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Cuadrilla App</h2>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Gestión de Costaleros</p>
                    </div>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-8">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-4">
                            {group.title && (
                                <h3 className="px-4 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{group.title}</h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center justify-between px-4 h-12 rounded-2xl transition-all group",
                                                isActive
                                                    ? "bg-primary/5 border border-primary/10 text-primary font-black"
                                                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    isActive ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-400 group-hover:bg-white group-hover:text-primary"
                                                )}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className="text-sm">{item.label}</span>
                                            </div>
                                            <ChevronDown size={14} className="-rotate-90 opacity-20" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Temporada Selector */}
                    <div className="space-y-4">
                        <h3 className="px-4 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{loadingSeasons ? "Cargando..." : "TEMPORADA ACTIVA"}</h3>
                        <div className="px-4">
                            <button
                                onClick={() => setSeasonsOpen(!seasonsOpen)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 h-14 bg-neutral-50 rounded-2xl border border-black/5 text-sm font-bold text-neutral-900 transition-all",
                                    seasonsOpen && "ring-2 ring-primary/20 border-primary"
                                )}
                            >
                                <span className="uppercase">{activeSeason?.nombre || "Seleccionar..."}</span>
                                <ChevronDown size={16} className={cn("transition-transform", seasonsOpen && "rotate-180")} />
                            </button>

                            {/* Dropdown de Temporadas */}
                            <div className={cn(
                                "grid transition-all duration-300 ease-in-out overflow-hidden",
                                seasonsOpen ? "grid-rows-[1fr] mt-2 opacity-100" : "grid-rows-[0fr] mt-0 opacity-0"
                            )}>
                                <div className="min-h-0 bg-white border border-black/5 rounded-2xl shadow-xl overflow-hidden">
                                    {temporadasList.map((temp) => (
                                        <button
                                            key={temp.id}
                                            onClick={() => handleSwitchSeason(temp)}
                                            className={cn(
                                                "w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between hover:bg-neutral-50 transition-colors border-b border-black/5 last:border-0",
                                                temp.activa ? "bg-primary/5 text-primary" : "text-neutral-500"
                                            )}
                                        >
                                            {temp.nombre}
                                            {temp.activa && <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />}
                                        </button>
                                    ))}
                                    {temporadasList.length === 0 && (
                                        <div className="p-4 text-center text-[10px] text-neutral-400 uppercase">
                                            No hay temporadas
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Side */}
                <div className="p-6 border-t border-black/5 space-y-4">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] text-neutral-300 font-black tracking-widest uppercase">v1.2.95</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
