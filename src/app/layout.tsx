import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "iCuadrilla - Gestión de Costaleros",
    description: "App privada para la gestión de cuadrillas de costaleros",
    manifest: "/manifest.json",
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
    themeColor: "#165d31",
};

import { LayoutProvider } from "@/components/layout-context";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";
import { OfflineBanner } from "@/components/offline-banner";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <OfflineBanner />
                <LayoutProvider>
                    <LayoutWrapper>
                        {children}
                    </LayoutWrapper>
                </LayoutProvider>
                <ScrollToTopButton />
            </body>
        </html>
    );
}
