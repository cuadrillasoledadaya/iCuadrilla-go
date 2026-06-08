-- Add puntuacion_total column to costaleros table for iRelevos integration
-- This column stores the cumulative attendance score for the active season.
-- It is automatically updated by triggers on the asistencias table.
-- Default value is 0.

ALTER TABLE costaleros ADD COLUMN IF NOT EXISTS puntuacion_total NUMERIC DEFAULT 0;

COMMENT ON COLUMN costaleros.puntuacion_total IS 'Puntuación acumulada de asistencia en la temporada activa. Presente=1, Justificado=0.5, Ausente=0. Actualizado automáticamente vía trigger.';
