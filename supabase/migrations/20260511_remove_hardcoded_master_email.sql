-- ==============================================================================
-- MIGRACIÓN DE SEGURIDAD: ELIMINAR EMAIL HARDCODED DE RLS (v2)
-- Fecha: 2026-05-11
-- Descripción: Crea tabla app_settings (key-value) y actualiza get_user_role()
--              para leer el email maestro desde la tabla en vez de hardcoded.
--
-- INSTRUCCIONES POST-MIGRACIÓN (cambiar email cuando sea necesario):
--   UPDATE public.app_settings SET value = 'tu-email@ejemplo.com' WHERE key = 'master_email';
-- ==============================================================================

-- 1. Tabla de configuración (sin RLS para que funcione desde funciones SECURITY DEFINER)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Desactivar RLS en app_settings (es config pública para funciones internas)
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- 2. Insertar valor por defecto (el email que estaba hardcoded)
INSERT INTO public.app_settings (key, value)
VALUES ('master_email', 'proyectoszipi@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- 3. Actualizar función para leer desde la tabla
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    CASE
      WHEN auth.jwt() ->> 'email' = (SELECT value FROM public.app_settings WHERE key = 'master_email') THEN 'superadmin'
      ELSE COALESCE(
        (SELECT rol FROM public.costaleros WHERE user_id = auth.uid()),
        'costalero'
      )
    END;
$$;
