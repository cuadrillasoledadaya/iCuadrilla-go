-- ==============================================================================
-- MIGRACIÓN: Agregar puesto_secundario a tabla costaleros
-- Fecha: 2024
-- Descripción: Añade campo opcional puesto_secundario para almacenar un segundo puesto
--              por costalero (ej. si puede ser Fijador y también Patero)
-- ==============================================================================

-- Agregar columna puesto_secundario
ALTER TABLE public.costaleros 
ADD COLUMN IF NOT EXISTS puesto_secundario TEXT;

-- Comentario explicativo
COMMENT ON COLUMN public.costaleros.puesto_secundario IS 'Puesto secundario opcional del costalero (ej. Patero Izq, Fijador Der, etc.)';