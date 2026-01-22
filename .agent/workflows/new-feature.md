---
description: Crear un nuevo módulo en el dashboard (Página + Sidebar)
---

# Workflow New Feature

Este workflow automatiza la creación de una nueva sección en el dashboard de iCuadrilla.

1. Crear el directorio en `src/app/(dashboard)/[nombre-feature]`
2. Crear un archivo `page.tsx` base en ese directorio usando esta plantilla:

```tsx
"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function [FeatureName]Page() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { isAdmin, loading } = useUserRole();

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-black/5 flex items-center px-4 shrink-0">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-neutral-500 sm:hidden">
                        <Menu size={24} />
                    </button>
                    <h1 className="ml-2 text-lg font-black text-primary uppercase tracking-tight">
                        [Nombre de la Feature]
                    </h1>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-neutral-500">Bienvenido al nuevo módulo [Nombre de la Feature].</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
```

1. Localizar `src/components/sidebar.tsx` y añadir el nuevo objeto al array `menuGroups` (en el grupo principal o en GESTIÓN según corresponda).

2. Verificar que la ruta es accesible y la navegación funciona.
