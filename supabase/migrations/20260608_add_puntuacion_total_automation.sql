-- Migration: Add puntuacion_total column and automation triggers
-- 1. Add column
ALTER TABLE costaleros ADD COLUMN IF NOT EXISTS puntuacion_total NUMERIC DEFAULT 0;

-- 2. Function to recalculate puntuacion_total for a costalero in a specific season
CREATE OR REPLACE FUNCTION recalculate_costalero_score(p_costalero_id UUID, p_temporada_id UUID)
RETURNS void AS $$
DECLARE
    v_score NUMERIC;
BEGIN
    SELECT COALESCE(SUM(
        CASE a.estado
            WHEN 'presente' THEN 1.0
            WHEN 'justificado' THEN 0.5
            WHEN 'justificada' THEN 0.5
            ELSE 0
        END
    ), 0)
    INTO v_score
    FROM asistencias a
    JOIN eventos e ON a.evento_id = e.id
    WHERE a.costalero_id = p_costalero_id
      AND e.temporada_id = p_temporada_id;

    UPDATE costaleros
    SET puntuacion_total = v_score
    WHERE id = p_costalero_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger function for asistencias table
CREATE OR REPLACE FUNCTION update_costalero_score_on_asistencia()
RETURNS TRIGGER AS $$
DECLARE
    v_temporada_id UUID;
BEGIN
    -- Get temporada_id from the event
    SELECT temporada_id INTO v_temporada_id
    FROM eventos
    WHERE id = COALESCE(NEW.evento_id, OLD.evento_id);

    -- Recalculate score for the costalero in that season
    IF v_temporada_id IS NOT NULL THEN
        PERFORM recalculate_costalero_score(COALESCE(NEW.costalero_id, OLD.costalero_id), v_temporada_id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on asistencias
DROP TRIGGER IF EXISTS trg_update_costalero_score ON asistencias;
CREATE TRIGGER trg_update_costalero_score
    AFTER INSERT OR UPDATE OR DELETE ON asistencias
    FOR EACH ROW
    EXECUTE FUNCTION update_costalero_score_on_asistencia();

-- 5. Function to reset scores when season changes
CREATE OR REPLACE FUNCTION reset_scores_on_season_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If a season is being set to active, reset all scores
    IF NEW.activa = true AND OLD.activa = false THEN
        UPDATE costaleros SET puntuacion_total = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger on temporadas table
DROP TRIGGER IF EXISTS trg_reset_scores_on_season_change ON temporadas;
CREATE TRIGGER trg_reset_scores_on_season_change
    AFTER UPDATE ON temporadas
    FOR EACH ROW
    EXECUTE FUNCTION reset_scores_on_season_change();

-- 7. Initial calculation for existing data
UPDATE costaleros c
SET puntuacion_total = COALESCE(
    (SELECT SUM(
        CASE a.estado
            WHEN 'presente' THEN 1.0
            WHEN 'justificado' THEN 0.5
            WHEN 'justificada' THEN 0.5
            ELSE 0
        END
    )
    FROM asistencias a
    JOIN eventos e ON a.evento_id = e.id
    WHERE a.costalero_id = c.id
      AND e.temporada_id = (SELECT id FROM temporadas WHERE activa = true LIMIT 1)), 
    0
);
