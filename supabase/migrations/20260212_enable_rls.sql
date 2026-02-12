-- ==============================================================================
-- MIGRACIÓN DE SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- Fecha: 12-02-2026
-- Descripción: Habilita RLS en todas las tablas y define políticas de acceso.
-- ==============================================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.costaleros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repertorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporadas ENABLE ROW LEVEL SECURITY;

-- 2. Función Helper Segura para obtener rol (Evita recursión infinita)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT rol FROM public.costaleros WHERE user_id = auth.uid();
$$;

-- ==============================================================================
-- POLÍTICAS: COSTALEROS
-- ==============================================================================

-- Lectura: Todos los autenticados pueden ver la lista de costaleros (necesario para la app)
CREATE POLICY "costaleros_select_all" ON public.costaleros
FOR SELECT TO authenticated USING (true);

-- Modificación (Update): Solo el propio usuario o Capataz/Auxiliar
CREATE POLICY "costaleros_update_own_or_admin" ON public.costaleros
FOR UPDATE TO authenticated USING (
  auth.uid() = user_id 
  OR public.get_user_role() IN ('capataz', 'auxiliar')
);

-- Inserción (Insert): Solo Capataz/Auxiliar (y triggers de sistema)
CREATE POLICY "costaleros_insert_admin" ON public.costaleros
FOR INSERT TO authenticated WITH CHECK (
  public.get_user_role() IN ('capataz', 'auxiliar')
);

-- Eliminación (Delete): Solo Capataz/Auxiliar
CREATE POLICY "costaleros_delete_admin" ON public.costaleros
FOR DELETE TO authenticated USING (
  public.get_user_role() IN ('capataz', 'auxiliar')
);

-- ==============================================================================
-- POLÍTICAS: EVENTOS
-- ==============================================================================

-- Lectura: Todos los autenticados
CREATE POLICY "eventos_select_all" ON public.eventos
FOR SELECT TO authenticated USING (true);

-- Modificación Total: Solo Capataz/Auxiliar
CREATE POLICY "eventos_all_admin" ON public.eventos
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('capataz', 'auxiliar')
);

-- ==============================================================================
-- POLÍTICAS: ASISTENCIAS
-- ==============================================================================

-- Lectura: Todos los autenticados
CREATE POLICY "asistencias_select_all" ON public.asistencias
FOR SELECT TO authenticated USING (true);

-- Modificación: Solo Admins
CREATE POLICY "asistencias_all_admin" ON public.asistencias
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('capataz', 'auxiliar')
);

-- Nota: Si los usuarios pueden marcar su propia asistencia, descomentar:
-- CREATE POLICY "asistencias_insert_own" ON public.asistencias
-- FOR INSERT TO authenticated WITH CHECK (
--   costalero_id IN (SELECT id FROM public.costaleros WHERE user_id = auth.uid())
-- );

-- ==============================================================================
-- POLÍTICAS: NOTIFICACIONES
-- ==============================================================================

-- Lectura: Solo el destinatario o Admins
CREATE POLICY "notificaciones_select_own" ON public.notificaciones
FOR SELECT TO authenticated USING (
  costalero_id IN (SELECT id FROM public.costaleros WHERE user_id = auth.uid())
  OR public.get_user_role() IN ('capataz', 'auxiliar')
);

-- Inserción: Sistema (normalmente vía funciones o admins)
CREATE POLICY "notificaciones_insert_all" ON public.notificaciones
FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================================================
-- POLÍTICAS: REPERTORIOS
-- ==============================================================================

-- Lectura: Todos
CREATE POLICY "repertorios_select_all" ON public.repertorios
FOR SELECT TO authenticated USING (true);

-- Gestión: Solo Admins
CREATE POLICY "repertorios_admin" ON public.repertorios
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('capataz', 'auxiliar')
);

-- ==============================================================================
-- POLÍTICAS: TEMPORADAS
-- ==============================================================================

CREATE POLICY "temporadas_select_all" ON public.temporadas
FOR SELECT TO authenticated USING (true);

CREATE POLICY "temporadas_admin" ON public.temporadas
FOR ALL TO authenticated USING (
  public.get_user_role() IN ('capataz', 'auxiliar')
);
