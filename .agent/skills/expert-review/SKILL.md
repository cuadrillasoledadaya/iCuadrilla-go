---
name: expert-review
description: Skill especializado en auditar arquitectura, seguridad y UX del proyecto iCuadrilla.
---

# Expert Review Skill

Este skill permite realizar análisis profundos del código para asegurar que cumple con los estándares más altos de calidad.

## Áreas de Auditoría

### 1. Seguridad y Datos

- **RLS (Row Level Security):** Verificar que cada tabla en Supabase tenga políticas que limiten el acceso según el rol del usuario (admin, costalero, etc.).
- **Validación con Zod:** Asegurar que todos los inputs de formularios y respuestas de API estén tipados y validados.
- **Manejo de Roles:** Comprobar que el hook `useUserRole` se utiliza correctamente para proteger componentes e interacciones sensibles.

### 2. Rendimiento y Arquitectura

- **Next.js App Router:** Verificar el uso correcto de `Server Components` vs `Client Components`.
- **Supabase Queries:** Buscar patrones de "Select *" innecesarios o queries que podrían causar fugas de memoria o lentitud (ej. n+1 queries).
- **Offline First:** Auditar cómo se manejan los estados de carga y errores de red en sincronización con `SyncProvider`.

### 3. UX y Estética Premium

- **Consistencia Visual:** Verificar el uso de tokens de diseño en `tailwind.config.js`.
- **Micro-animaciones:** Sugerir transiciones suaves en botones, modales y cambios de estado.
- **Glassmorphism:** Asegurar que los efectos de desenfoque y transparencias no afecten la legibilidad.

## Cómo usar este Skill

Cuando el usuario pida una "revisión experta" o analices código nuevo:

1. Aplica los criterios anteriores.
2. Genera un reporte conciso destacando: **Hallazgos Críticos**, **Oportunidades de Mejora** y **Pasos de Implementación**.
