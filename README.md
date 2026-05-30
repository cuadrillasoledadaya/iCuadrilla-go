# iCuadrilla - Gestión de Cuadrilla

PWA para gestión de costaleros, eventos y asistencias.

## Stack técnico

- **Framework**: Next.js 14.2.35
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth con roles
- **UI**: Tailwind CSS + Radix UI
- **Validaciones**: Zod + React Hook Form

## Variables de entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key

# Seguridad
MASTER_EMAIL=usuario-maestro@ejemplo.com
API_SECRET_KEY=clave-segura-api
```

## Roles de usuario

| Rol          | Permisos                           |
| ------------ | ---------------------------------- |
| `superadmin` | Control total (desde MASTER_EMAIL) |
| `capataz`    | Editar costaleros, crear eventos   |
| `auxiliar`   | Scanner de asistencia              |
| `costalero`  | Ver dashboard personal             |

## Estructura de archivos

```
src/
├── app/
│   ├── api/costaleros/route.ts    # API pública (requiere API_SECRET_KEY)
│   ├── (dashboard)/
│   │   ├── costaleros/nuevo/      # Alta de costaleros
│   │   ├── cuadrilla/[id]/        # Ficha y edición
│   │   └── eventos/[id]/relevos/  # Gestión de relevos
├── hooks/
│   └── useCuadrilla.ts            # Hook principal para cuadrilla
└── components/ui/
    └── puesto-select.tsx          # Componente reutilizable
```

## API Endpoints

### GET /api/costaleros

**Headers:**

```
Authorization: Bearer API_SECRET_KEY
```

**Response (200):**

```json
[
  {
    "id": "uuid",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "apodo": "El Rubio",
    "trabajadera": 3,
    "puesto": "Fijador Izq",
    "puesto_secundario": "Patero Der",
    "email": "juan@ejemplo.com"
  }
]
```

**Roles:** Solo usuarios activos (`estado: 'activo'`)

## Despliegue

### Requisitos

- Node.js 18+
- Cuenta Supabase configurada
- Variables de entorno en `.env.local`

### Build

```bash
npm run build
npm start
```

### Migraciones

Ejecutar en Supabase SQL Editor:

1. `supabase/migrations/20260212_enable_rls.sql`
2. `supabase/migrations/20240101_add_puesto_secundario.sql`
