"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, BarChart, Calendar } from "lucide-react";
import { useLayout } from "./layout-context";

const navItems = [
    { label: "Inicio", href: "/dashboard", icon: Home },
    { label: "Eventos", href: "/eventos", icon: Calendar },
    { label: "Cuadrilla", href: "/cuadrilla", icon: Users },
    { label: "Temporadas", href: "/temporadas", icon: BarChart },
];

export function Navbar() {
    const pathname = usePathname();
    const { isSidebarOpen } = useLayout();

    // No mostrar navbar en landing, login, registro ni en la gestión de relevos
    if (pathname === "/" || pathname === "/login" || pathname === "/registro" || pathname.includes("/relevos")) return null;

    return (
        <nav className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-md h-20 z-[100] glass-card rounded-[2.5rem] px-2 shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-white/50 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "translate-y-[200%] opacity-0" : "translate-y-0 opacity-100"
        )}>
            <div className="grid grid-cols-4 h-full items-center">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // El inicio se marca activo tanto en / como en /dashboard
                    const isActive = item.href === "/dashboard"
                        ? (pathname === "/dashboard" || pathname === "/")
                        : pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center h-full transition-all duration-300",
                                isActive ? "text-primary" : "text-neutral-500 hover:text-black"
                            )}
                        >
                            {isActive && (
                                <span className="absolute top-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                            )}
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
                                isActive ? "bg-primary/10 scale-110" : "scale-100 opacity-70"
                            )}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold mt-1 tracking-tight transition-all",
                                isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-0.5"
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
