---
description: Generar componentes UI con estética premium (Vibrant, Glossy, Animated)
---

# Workflow UI Scaffold

Este workflow genera componentes de interfaz que mantienen la línea de diseño premium del proyecto.

1. Identificar el propósito del componente (Botón, Card, Modal, etc.).
2. Crear el archivo en `src/components/ui/` con la siguiente estructura base:

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const componentVariants = cva(
  "transition-all duration-300 ease-out active:scale-95",
  {
    variants: {
      variant: {
        premium: "bg-white border border-black/5 shadow-sm hover:shadow-md rounded-3xl",
        glass: "bg-white/60 backdrop-blur-md border border-white/20 shadow-lg",
        primary: "bg-primary text-white font-bold rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "premium",
    },
  }
);

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof componentVariants> {}

export function MyComponent({ className, variant, ...props }: ComponentProps) {
  return (
    <div className={cn(componentVariants({ variant }), className)} {...props} />
  );
}
```

1. Añadir micro-animaciones usando `framer-motion` o CSS según corresponda.
2. Asegurar que el componente sea accesible y responsive.
