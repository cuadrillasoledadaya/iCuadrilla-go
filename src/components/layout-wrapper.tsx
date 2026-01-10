"use client";

import { useLayout } from "./layout-context";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, setSidebarOpen } = useLayout();

    return (
        <>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="min-h-screen">
                {children}
            </main>

            <Navbar />
        </>
    );
}
