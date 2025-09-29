-- Criar tabela flight_schedules se não existir
CREATE TABLE IF NOT EXISTS flight_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flight_date DATE NOT NULL,
    flight_time TIME NOT NULL,
    military_ids TEXT NOT NULL, -- JSON array como string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flight_schedules_updated_at 
    BEFORE UPDATE ON flight_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar RLS temporariamente para testes
ALTER TABLE flight_schedules DISABLE ROW LEVEL SECURITY;

-- Garantir permissões
GRANT ALL ON flight_schedules TO anon;
GRANT ALL ON flight_schedules TO authenticated;
GRANT ALL ON flight_schedules TO service_role;

-- Inserir dados de exemplo
INSERT INTO flight_schedules (flight_date, flight_time, military_ids) VALUES
    ('2024-12-20', '08:00:00', '["1", "2"]'),
    ('2024-12-21', '14:30:00', '["3"]'),
    ('2024-12-22', '10:15:00', '["1", "4", "5"]')
ON CONFLICT DO NOTHING;
