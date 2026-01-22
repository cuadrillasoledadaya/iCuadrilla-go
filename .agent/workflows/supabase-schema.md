---
description: Crear tablas, políticas RLS y regenerar tipos de Supabase
---

# Workflow Supabase Schema

Este workflow facilita la gestión de la base de datos de manera consistente y segura.

1. Identificar el `project_id` del proyecto de Supabase.
2. Definir el esquema SQL de la tabla respetando los tipos de datos del proyecto (UUID para IDs, timestamps, etc.).
3. Generar un archivo de migración (.sql) en la consola o usar el comando correspondiente.
4. Aplicar políticas RLS (Row Level Security) estándar:

   ```sql
   -- Ejemplo de política para admin
   CREATE POLICY "Admins have full access" ON "public"."mi_tabla"
   FOR ALL TO authenticated
   USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
   ```

5. Ejecutar la generación de tipos de Supabase para mantener el tipado en el frontend:
// turbo
`npx supabase gen types typescript --project-id SEU_ID_PROJETO > src/types/supabase.ts` (Ajustar ruta si es necesario).
