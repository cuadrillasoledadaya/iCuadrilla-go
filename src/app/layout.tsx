import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "iCuadrilla - Gestión de Costaleros",
    description: "App privada para la gestión de cuadrillas de costaleros",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "iCuadrilla",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport = {
    themeColor: "#000000",
};

import { LayoutProvider } from "@/components/layout-context";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";
import { OfflineBanner } from "@/components/offline-banner";
import { SyncProvider } from "@/components/sync-provider";
import { SessionTimeout } from "@/components/session-timeout";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <SessionTimeout />
                <OfflineBanner />
                <SyncProvider>
                    <LayoutProvider>
                        <LayoutWrapper>
                            {children}
                        </LayoutWrapper>
                    </LayoutProvider>
                </SyncProvider>
                <ScrollToTopButton />
            </body>
        </html>
    );
}
