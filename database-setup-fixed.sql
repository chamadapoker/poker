-- =====================================================
-- CONFIGURAÇÃO CORRIGIDA DO BANCO DE DADOS SUPABASE
-- Sistema POKER 360
-- =====================================================

-- 1. REMOVER TABELAS EXISTENTES (se houver)
DROP TABLE IF EXISTS military_attendance_records CASCADE;
DROP TABLE IF EXISTS military_justifications CASCADE;
DROP TABLE IF EXISTS military_personnel CASCADE;

-- 2. CRIAR TABELAS COM ESTRUTURA CORRETA

-- Tabela de registros de presença militar
CREATE TABLE military_attendance_records (
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
CREATE TABLE military_justifications (
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
CREATE TABLE military_personnel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    rank VARCHAR NOT NULL,
    squadron VARCHAR DEFAULT 'POKER',
    role VARCHAR DEFAULT 'military',
    email VARCHAR,
    phone_number VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX idx_attendance_military_id ON military_attendance_records(military_id);
CREATE INDEX idx_attendance_date ON military_attendance_records(date);
CREATE INDEX idx_justifications_military_id ON military_justifications(military_id);
CREATE INDEX idx_justifications_dates ON military_justifications(start_date, end_date);
CREATE INDEX idx_personnel_military_id ON military_personnel(military_id);

-- 4. HABILITAR RLS (Row Level Security)
ALTER TABLE military_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS DE SEGURANÇA (para desenvolvimento)
-- Política para permitir leitura pública
CREATE POLICY "Allow public read access" ON military_attendance_records
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON military_justifications
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON military_personnel
    FOR SELECT USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert access" ON military_attendance_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access" ON military_justifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access" ON military_personnel
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Allow public update access" ON military_attendance_records
    FOR UPDATE USING (true);

CREATE POLICY "Allow public update access" ON military_justifications
    FOR UPDATE USING (true);

CREATE POLICY "Allow public update access" ON military_personnel
    FOR UPDATE USING (true);

-- Política para permitir exclusão pública
CREATE POLICY "Allow public delete access" ON military_attendance_records
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete access" ON military_justifications
    FOR DELETE USING (true);

CREATE POLICY "Allow public delete access" ON military_personnel
    FOR DELETE USING (true);

-- 6. INSERIR DADOS DE EXEMPLO

-- Inserir pessoal militar
INSERT INTO military_personnel (military_id, name, rank, squadron, role) VALUES
    ('1', 'TC CARNEIRO', 'TC', 'POKER', 'military'),
    ('2', 'MJ MAIA', 'MJ', 'POKER', 'military'),
    ('3', 'CP MIRANDA', 'CP', 'POKER', 'military'),
    ('4', 'CP CAMILA CALDAS', 'CP', 'POKER', 'military'),
    ('5', 'CP FARIAS', 'CP', 'POKER', 'military'),
    ('6', 'CP SPINELLI', 'CP', 'POKER', 'military'),
    ('7', 'CP ALMEIDA', 'CP', 'POKER', 'military'),
    ('8', 'CP JÚNIOR', 'CP', 'POKER', 'military'),
    ('9', 'CP FELIPPE MIRANDA', 'CP', 'POKER', 'military'),
    ('10', 'CP EDUARDO', 'CP', 'POKER', 'military');

-- Inserir registros de presença de exemplo
INSERT INTO military_attendance_records (military_id, military_name, rank, call_type, date, status) VALUES
    ('1', 'TC CARNEIRO', 'TC', 'formatura', CURRENT_DATE, 'presente'),
    ('2', 'MJ MAIA', 'MJ', 'formatura', CURRENT_DATE, 'ausente'),
    ('3', 'CP MIRANDA', 'CP', 'formatura', CURRENT_DATE, 'presente'),
    ('4', 'CP CAMILA CALDAS', 'CP', 'formatura', CURRENT_DATE, 'presente'),
    ('5', 'CP FARIAS', 'CP', 'formatura', CURRENT_DATE, 'ausente');

-- Inserir justificativas de exemplo
INSERT INTO military_justifications (military_id, military_name, type, reason, start_date, end_date, approved) VALUES
    ('6', 'CP SPINELLI', 'atestado', 'Atestado médico', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', true),
    ('7', 'CP ALMEIDA', 'dispensa', 'Dispensa oficial', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true),
    ('8', 'CP JÚNIOR', 'voo', 'Voo de instrução', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', true);

-- 7. CRIAR FUNÇÃO E TRIGGERS PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_military_attendance_records_updated_at
    BEFORE UPDATE ON military_attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_military_justifications_updated_at
    BEFORE UPDATE ON military_justifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_military_personnel_updated_at
    BEFORE UPDATE ON military_personnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. VERIFICAR SE AS TABELAS FORAM CRIADAS CORRETAMENTE
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('military_attendance_records', 'military_justifications', 'military_personnel')
ORDER BY table_name;

-- 9. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    'military_attendance_records' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_attendance_records'
ORDER BY ordinal_position;

SELECT 
    'military_justifications' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_justifications'
ORDER BY ordinal_position;

SELECT 
    'military_personnel' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_personnel'
ORDER BY ordinal_position;

-- 10. VERIFICAR DADOS INSERIDOS
SELECT 'military_personnel' as table_name, COUNT(*) as total_records FROM military_personnel
UNION ALL
SELECT 'military_attendance_records' as table_name, COUNT(*) as total_records FROM military_attendance_records
UNION ALL
SELECT 'military_justifications' as table_name, COUNT(*) as total_records FROM military_justifications;
