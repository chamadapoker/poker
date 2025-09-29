-- scripts/005_create_flights_table.sql
-- Cria a tabela de voos e as políticas/​gatilhos associados.
-- O script é idempotente: pode ser executado várias vezes sem causar erros.

--------------------------------------------------
-- Extensões necessárias
--------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
-- Tabela: flights
--------------------------------------------------
CREATE TABLE IF NOT EXISTS flights (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number    TEXT UNIQUE NOT NULL,
    aircraft_type    TEXT,
    departure_time   TIMESTAMPTZ NOT NULL,
    arrival_time     TIMESTAMPTZ,
    origin           TEXT NOT NULL,
    destination      TEXT NOT NULL,
    pilot_id         UUID REFERENCES military_personnel(id),
    copilot_id       UUID REFERENCES military_personnel(id),
    status           TEXT NOT NULL DEFAULT 'Scheduled', -- Scheduled | Departed | Arrived | Cancelled | Delayed
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------
-- Gatilho: manter updated_at sincronizado
--------------------------------------------------
CREATE OR REPLACE FUNCTION update_flights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_flights_updated_at ON flights;

CREATE TRIGGER trg_update_flights_updated_at
BEFORE UPDATE ON flights
FOR EACH ROW
EXECUTE FUNCTION update_flights_updated_at();

--------------------------------------------------
-- Políticas de RLS
--------------------------------------------------
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- Leitura aberta a todos
CREATE POLICY flights_select_all
    ON flights
    FOR SELECT
    USING (TRUE);

-- Inserção para usuários autenticados
CREATE POLICY flights_insert_authenticated
    ON flights
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Atualização para usuários autenticados
CREATE POLICY flights_update_authenticated
    ON flights
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Exclusão para usuários autenticados
CREATE POLICY flights_delete_authenticated
    ON flights
    FOR DELETE
    USING (auth.role() = 'authenticated');
