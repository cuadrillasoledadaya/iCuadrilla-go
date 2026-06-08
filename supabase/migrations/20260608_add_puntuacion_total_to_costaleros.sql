-- Add puntuacion_total column to costaleros table for iRelevos integration
-- This column stores the cumulative attendance score for the active season.
-- It is updated manually or via trigger (recommended).
-- Default value is 0.

ALTER TABLE costaleros ADD COLUMN IF NOT EXISTS puntuacion_total NUMERIC DEFAULT 0;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN costaleros.puntuacion_total IS 'Puntuación acumulada de asistencia en la temporada activa. Presente=1, Justificado=0.5, Ausente=0. Actualizar vía trigger o script.';
