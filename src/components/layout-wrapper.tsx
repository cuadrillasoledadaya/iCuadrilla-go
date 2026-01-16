"use client";

import { useLayout } from "./layout-context";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setSidebarOpen } = useLayout();
    const pathname = usePathname();
    const showNavbar = pathname !== "/" && pathname !== "/login" && pathname !== "/registro" && !pathname.includes("/relevos");

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className={cn(
                "min-h-screen",
                showNavbar && "pb-20"
            )}>
                {children}
            </main>

            <Navbar />
        </div>
    );
}
