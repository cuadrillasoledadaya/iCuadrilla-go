"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, QrCode, Users, Repeat, Bell, BarChart, Calendar } from "lucide-react";

const navItems = [
    { label: "Inicio", href: "/dashboard", icon: Home },
    { label: "Escáner", href: "/asistencia/scanner", icon: QrCode },
    { label: "Relevos", href: "/relevos", icon: Repeat },
    { label: "Cuadrilla", href: "/cuadrilla", icon: Users },
    { label: "Temporadas", href: "/temporadas", icon: Calendar },
];

export function Navbar() {
    const pathname = usePathname();

    // No mostrar navbar en login ni registro
    if (pathname === "/login" || pathname === "/registro") return null;

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg glass-card rounded-[2.5rem] h-20 z-50 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40">
            <div className="flex justify-around items-center h-full gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-full transition-all duration-300",
                                isActive ? "text-[#5D0E11]" : "text-neutral-400 hover:text-neutral-600"
                            )}
                        >
                            {isActive && (
                                <span className="absolute -top-1 w-1 h-1 bg-[#5D0E11] rounded-full animate-pulse" />
                            )}
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-300",
                                isActive ? "bg-[#5D0E11]/10 scale-110" : "scale-100"
                            )}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold mt-1 tracking-tight transition-all",
                                isActive ? "opacity-100 translate-y-0" : "opacity-80 translate-y-0.5"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
