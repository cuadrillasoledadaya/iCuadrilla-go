-- ==============================================================================
-- MIGRACIÓN DE SEGURIDAD: ELIMINAR EMAIL HARDCODED DE RLS
-- Fecha: 2026-05-11
-- Descripción: Reemplaza el email hardcoded en get_user_role() por un setting
--              de base de datos configurable (app.settings.master_email).
--
-- INSTRUCCIONES POST-MIGRACIÓN:
--   Ejecutar en Supabase SQL Editor (una sola vez):
--     ALTER DATABASE postgres SET "app.settings.master_email" = 'tu-email@ejemplo.com';
--
--   Verificar que esté configurado:
--     SHOW "app.settings.master_email";
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    CASE
      WHEN auth.jwt() ->> 'email' = COALESCE(
        current_setting('app.settings.master_email', true),
        'proyectoszipi@gmail.com'  -- Fallback temporal; configurar setting ASAP
      ) THEN 'superadmin'
      ELSE COALESCE(
        (SELECT rol FROM public.costaleros WHERE user_id = auth.uid()),
        'costalero'
      )
    END;
$$;
