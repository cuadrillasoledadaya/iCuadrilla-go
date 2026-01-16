import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "iCuadrilla - Gestión de Costaleros",
    description: "App privada para la gestión de cuadrillas de costaleros",
    manifest: "/manifest.json",
};

import { LayoutProvider } from "@/components/layout-context";
import { LayoutWrapper } from "@/components/layout-wrapper";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <LayoutProvider>
                    <LayoutWrapper>
                        {children}
                    </LayoutWrapper>
                </LayoutProvider>
            </body>
        </html>
    );
}
