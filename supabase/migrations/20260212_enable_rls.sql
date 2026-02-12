-- ==============================================================================
-- MIGRACIÓN DE SEGURIDAD V2: RLS CON ROL SUPERADMIN
-- Fecha: 12-02-2026
-- Descripción: Refina permisos. Superadmin (email maestro) tiene control exclusivo
--              sobre roles y temporadas.
-- ==============================================================================

-- 1. Habilitar RLS (Idempotente)
ALTER TABLE public.costaleros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporadas ENABLE ROW LEVEL SECURITY;

-- 2. Función Helper Mejorada: Detecta SUPERADMIN por email
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      -- 🚨 IMPORTANTE: Reemplazar con tu email real si cambia
      WHEN auth.jwt() ->> 'email' = 'proyectoszipi@gmail.com' THEN 'superadmin'
      ELSE COALESCE(
        (SELECT rol FROM public.costaleros WHERE user_id = auth.uid()),
        'costalero'
      )
    END;
$$;

-- 3. Limpiar políticas antiguas (para evitar conflictos al re-ejecutar)
DROP POLICY IF EXISTS "costaleros_select_all" ON public.costaleros;
DROP POLICY IF EXISTS "costaleros_update_own_or_admin" ON public.costaleros;
DROP POLICY IF EXISTS "costaleros_insert_admin" ON public.costaleros;
DROP POLICY IF EXISTS "costaleros_delete_admin" ON public.costaleros;
DROP POLICY IF EXISTS "eventos_select_all" ON public.eventos;
DROP POLICY IF EXISTS "eventos_all_admin" ON public.eventos;
DROP POLICY IF EXISTS "asistencias_select_all" ON public.asistencias;
DROP POLICY IF EXISTS "asistencias_all_admin" ON public.asistencias;
DROP POLICY IF EXISTS "notificaciones_select_own" ON public.notificaciones;
DROP POLICY IF EXISTS "notificaciones_insert_all" ON public.notificaciones;
DROP POLICY IF EXISTS "repertorios_select_all" ON public.repertorios;
DROP POLICY IF EXISTS "repertorios_admin" ON public.repertorios;
DROP POLICY IF EXISTS "temporadas_select_all" ON public.temporadas;
DROP POLICY IF EXISTS "temporadas_admin" ON public.temporadas;

-- ==============================================================================
-- POLÍTICAS: TEMPORADAS (EXCLUSIVO SUPERADMIN)
-- ==============================================================================

CREATE POLICY "temporadas_select_all" ON public.temporadas
FOR SELECT TO authenticated USING (true);

CREATE POLICY "temporadas_superadmin" ON public.temporadas
FOR ALL TO authenticated USING (
  public.get_user_role() = 'superadmin'
);

-- ==============================================================================
-- POLÍTICAS: COSTALEROS (GESTIÓN DELICADA)
-- ==============================================================================

-- Lectura: Todos
CREATE POLICY "costaleros_select_all" ON public.costaleros
FOR SELECT TO authenticated USING (true);

-- Insert/Delete: Solo SUPERADMIN (Capataces no pueden crear/borrar fichas, solo Superadmin)
CREATE POLICY "costaleros_modify_superadmin" ON public.costaleros
FOR INSERT TO authenticated WITH CHECK (
  public.get_user_role() = 'superadmin'
);

CREATE POLICY "costaleros_delete_superadmin" ON public.costaleros
FOR DELETE TO authenticated USING (
  public.get_user_role() = 'superadmin'
);

-- Update: 
-- 1. Superadmin puede actualizar TODO.
-- 2. Capataz/Auxiliar pueden actualizar, PERO idealmente no el rol (controlado por App/Trigger, RLS permite update general).
-- 3. Usuario puede actualizar sus propios datos.
CREATE POLICY "costaleros_update" ON public.costaleros
FOR UPDATE TO authenticated USING (
  public.get_user_role() = 'superadmin' 
  OR public.get_user_role() IN ('capataz', 'auxiliar')
  OR auth.uid() = user_id
);

-- Trigger de seguridad para impedir cambios de rol excepto por Superadmin
CREATE OR REPLACE FUNCTION public.prevent_role_change_non_superadmin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol IS DISTINCT FROM OLD.rol THEN
    IF public.get_user_role() != 'superadmin' THEN
      RAISE EXCEPTION 'Solo el Superadmin puede cambiar roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_roles ON public.costaleros;
CREATE TRIGGER trg_protect_roles
BEFORE UPDATE ON public.costaleros
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change_non_superadmin();

-- ==============================================================================
-- POLÍTICAS: EVENTOS (Admin General)
-- ==============================================================================

CREATE POLICY "eventos_select_all" ON public.eventos
FOR SELECT TO authenticated USING (true);

CREATE POLICY "eventos_admin" ON public.eventos
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('superadmin', 'capataz', 'auxiliar')
);

-- ==============================================================================
-- POLÍTICAS: ASISTENCIAS (Admin General)
-- ==============================================================================

CREATE POLICY "asistencias_select_all" ON public.asistencias
FOR SELECT TO authenticated USING (true);

CREATE POLICY "asistencias_admin" ON public.asistencias
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('superadmin', 'capataz', 'auxiliar')
);

-- ==============================================================================
-- POLÍTICAS: REPERTORIOS (Admin General)
-- ==============================================================================

CREATE POLICY "repertorios_select_all" ON public.repertorios
FOR SELECT TO authenticated USING (true);

CREATE POLICY "repertorios_admin" ON public.repertorios
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('superadmin', 'capataz', 'auxiliar')
);

-- ==============================================================================
-- POLÍTICAS: NOTIFICACIONES
-- ==============================================================================

CREATE POLICY "notificaciones_select_own" ON public.notificaciones
FOR SELECT TO authenticated USING (
  costalero_id IN (SELECT id FROM public.costaleros WHERE user_id = auth.uid())
  OR public.get_user_role() IN ('superadmin', 'capataz', 'auxiliar')
);

CREATE POLICY "notificaciones_insert_all" ON public.notificaciones
FOR INSERT TO authenticated WITH CHECK (true);
