-- Script para criar a tabela military_events
-- Esta tabela é usada pelo componente EventCalendar

CREATE TABLE IF NOT EXISTS military_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    created_by_military_id TEXT REFERENCES military_personnel(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update the `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_military_events_updated_at
BEFORE UPDATE ON military_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Desabilitar RLS para facilitar o uso
ALTER TABLE military_events DISABLE ROW LEVEL SECURITY;

-- Inserir alguns eventos de exemplo para teste
INSERT INTO military_events (title, description, date, time, created_by_military_id) VALUES
('Reunião de Esquadrão', 'Reunião semanal para alinhamento de atividades', CURRENT_DATE + INTERVAL '1 day', '08:00:00', '1'),
('Treinamento de Voo', 'Treinamento prático para pilotos', CURRENT_DATE + INTERVAL '2 days', '14:00:00', '2'),
('Manutenção de Aeronaves', 'Verificação e manutenção preventiva', CURRENT_DATE + INTERVAL '3 days', '09:00:00', '3'),
('Auditoria de Segurança', 'Inspeção de segurança das instalações', CURRENT_DATE + INTERVAL '5 days', '10:00:00', '1');

-- Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'military_events'
ORDER BY ordinal_position;

-- Mostrar os eventos inseridos
SELECT * FROM military_events ORDER BY date, time;
