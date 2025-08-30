-- =====================================================
-- CONFIGURAÇÃO DO BANCO DE DADOS SUPABASE
-- Sistema POKER 360
-- =====================================================

-- Tabela de registros de presença militar
CREATE TABLE IF NOT EXISTS military_attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id VARCHAR NOT NULL,
    military_name VARCHAR NOT NULL,
    rank VARCHAR NOT NULL,
    call_type VARCHAR NOT NULL,
    date DATE NOT NULL,
    status VARCHAR NOT NULL,
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de justificativas militares
CREATE TABLE IF NOT EXISTS military_justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id VARCHAR NOT NULL,
    military_name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pessoal militar
CREATE TABLE IF NOT EXISTS military_personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    rank VARCHAR NOT NULL,
    squadron VARCHAR,
    role VARCHAR DEFAULT 'military',
    email VARCHAR,
    phone_number VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_attendance_military_id ON military_attendance_records(military_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON military_attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_justifications_military_id ON military_justifications(military_id);
CREATE INDEX IF NOT EXISTS idx_justifications_dates ON military_justifications(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_personnel_military_id ON military_personnel(military_id);

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE military_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para desenvolvimento)
CREATE POLICY "Allow public read access" ON military_attendance_records
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON military_justifications
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON military_personnel
    FOR SELECT USING (true);

-- Política para permitir inserção/atualização (para desenvolvimento)
CREATE POLICY "Allow public insert access" ON military_attendance_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access" ON military_justifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access" ON military_personnel
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON military_attendance_records
    FOR UPDATE USING (true);

CREATE POLICY "Allow public update access" ON military_justifications
    FOR UPDATE USING (true);

CREATE POLICY "Allow public update access" ON military_personnel
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON military_attendance_records
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete access" ON military_justifications
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete access" ON military_personnel
    FOR DELETE USING (true);

-- Inserir dados de exemplo para teste
INSERT INTO military_personnel (military_id, name, rank, squadron, role) VALUES
    ('1', 'TC CARNEIRO', 'TC', 'POKER', 'military'),
    ('2', 'MJ MAIA', 'MJ', 'POKER', 'military'),
    ('3', 'CP MIRANDA', 'CP', 'POKER', 'military'),
    ('4', 'CP CAMILA CALDAS', 'CP', 'POKER', 'military'),
    ('5', 'CP FARIAS', 'CP', 'POKER', 'military')
ON CONFLICT (military_id) DO NOTHING;

-- Inserir registros de presença de exemplo
INSERT INTO military_attendance_records (military_id, military_name, rank, call_type, date, status) VALUES
    ('1', 'TC CARNEIRO', 'TC', 'formatura', CURRENT_DATE, 'presente'),
    ('2', 'MJ MAIA', 'MJ', 'formatura', CURRENT_DATE, 'ausente'),
    ('3', 'CP MIRANDA', 'CP', 'formatura', CURRENT_DATE, 'presente')
ON CONFLICT DO NOTHING;

-- Inserir justificativas de exemplo
INSERT INTO military_justifications (military_id, military_name, type, reason, start_date, end_date, approved) VALUES
    ('4', 'CP CAMILA CALDAS', 'atestado', 'Atestado médico', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', true),
    ('5', 'CP FARIAS', 'dispensa', 'Dispensa oficial', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true)
ON CONFLICT DO NOTHING;

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_military_attendance_records_updated_at
    BEFORE UPDATE ON military_attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_military_justifications_updated_at
    BEFORE UPDATE ON military_justifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_military_personnel_updated_at
    BEFORE UPDATE ON military_personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários das tabelas
COMMENT ON TABLE military_attendance_records IS 'Registros de presença militar para diferentes tipos de chamada';
COMMENT ON TABLE military_justifications IS 'Justificativas de ausência militar aprovadas';
COMMENT ON TABLE military_personnel IS 'Cadastro de pessoal militar do Esquadrão';

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('military_attendance_records', 'military_justifications', 'military_personnel')
ORDER BY table_name;
