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
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-card rounded-3xl h-20 z-50 px-2">
            <div className="flex justify-around items-center h-full">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                            )}
                        >
                            <Icon size={18} className={isActive ? "scale-110" : ""} />
                            <span className="text-[9px] font-medium leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
