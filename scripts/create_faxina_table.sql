-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE FAXINA DAS INSTALAÇÕES
-- =====================================================
-- Este script cria a tabela cleaning_records para controle de limpeza
-- das instalações do 1º/10º GAV

-- 1. CRIAR TABELA CLEANING_RECORDS
-- =====================================================
CREATE TABLE IF NOT EXISTS cleaning_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    last_cleaning_date DATE NOT NULL,
    checked_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT idx_cleaning_records_sector UNIQUE(sector, location),
    CONSTRAINT idx_cleaning_records_date CHECK (last_cleaning_date <= CURRENT_DATE)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cleaning_records_sector ON cleaning_records(sector);
CREATE INDEX IF NOT EXISTS idx_cleaning_records_location ON cleaning_records(location);
CREATE INDEX IF NOT EXISTS idx_cleaning_records_date ON cleaning_records(last_cleaning_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_records_checked_by ON cleaning_records(checked_by);
CREATE INDEX IF NOT EXISTS idx_cleaning_records_created_at ON cleaning_records(created_at);

-- 3. HABILITAR RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE cleaning_records ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================
-- Usuários autenticados podem ler todos os registros
CREATE POLICY "authenticated_users_can_read_cleaning_records" ON cleaning_records
    FOR SELECT USING (auth.role() = 'authenticated');

-- Usuários autenticados podem inserir registros
CREATE POLICY "authenticated_users_can_insert_cleaning_records" ON cleaning_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usuários autenticados podem atualizar registros
CREATE POLICY "authenticated_users_can_update_cleaning_records" ON cleaning_records
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Usuários autenticados podem deletar registros
CREATE POLICY "authenticated_users_can_delete_cleaning_records" ON cleaning_records
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_cleaning_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cleaning_records_updated_at
    BEFORE UPDATE ON cleaning_records
    FOR EACH ROW
    EXECUTE FUNCTION update_cleaning_records_updated_at();

-- 6. INSERIR DADOS INICIAIS (baseados nos dados fornecidos)
-- =====================================================

-- SETOR 1 - S1 GABRIEL REIS
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 1 - S1 GABRIEL REIS', 'Bar CB/SD - N° 18', '2025-08-19', '2S BRAZ', 'Limpeza realizada conforme padrão'),
('SETOR 1 - S1 GABRIEL REIS', 'C PIS - N° 63', '2025-08-19', '2S BRAZ', 'Área limpa e organizada'),
('SETOR 1 - S1 GABRIEL REIS', 'Corredor SAP', '2025-08-19', '2S BRAZ', 'Corredor limpo e livre de obstáculos'),
('SETOR 1 - S1 GABRIEL REIS', 'Salas Briefing Ouros - N° 36', '2025-08-19', '2S BRAZ', 'Salas organizadas e limpas'),
('SETOR 1 - S1 GABRIEL REIS', 'Meteoro N° 57', '2025-08-19', '2S ORIEL', 'Local em conformidade');

-- SETOR 2 - S2 DA ROSA
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 2 - S2 DA ROSA', 'Bar SO/SGT - N° 8', '2025-08-18', '2S ORIEL', 'Bar limpo e organizado'),
('SETOR 2 - S2 DA ROSA', 'Corredor Vestiários', '2025-06-13', '2S BRAZ', 'Necessita nova limpeza'),
('SETOR 2 - S2 DA ROSA', 'Patrimônio - N° 17', '2025-09-02', '2S BRAZ', 'Limpeza recente realizada'),
('SETOR 2 - S2 DA ROSA', 'Sala Briefing Copas - N° 37', '2025-06-13', '2S BRAZ', 'Sala em bom estado'),
('SETOR 2 - S2 DA ROSA', 'Auditório - N° 31', '2025-06-13', '2S BRAZ', 'Auditório limpo e organizado');

-- SETOR 3 - S2 DENARDIN
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 3 - S2 DENARDIN', 'Corredor SOP / AUD', '2025-07-24', '2S BRAZ', 'Corredor limpo'),
('SETOR 3 - S2 DENARDIN', 'Vestiário Feminino - N° 16', '2025-07-24', '3S ANNE', 'Vestiário em conformidade'),
('SETOR 3 - S2 DENARDIN', 'CADO - N° 23', '2025-07-24', '3S PITTIGLIANI', 'Área limpa'),
('SETOR 3 - S2 DENARDIN', 'Contra-inteligência - N° 32', '2025-07-16', '3S MAIA', 'Sala organizada'),
('SETOR 3 - S2 DENARDIN', 'Doutrina - N° 22', '2025-07-16', '1S JACOBS', 'Local em bom estado');

-- SETOR 4 - S2 DOUGLAS SILVA
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 4 - S2 DOUGLAS SILVA', 'Corredor PIS', '2025-08-19', '2S BRAZ', 'Corredor limpo'),
('SETOR 4 - S2 DOUGLAS SILVA', 'Bar OF - N° 4', '2025-08-19', '2S BRAZ', 'Bar organizado'),
('SETOR 4 - S2 DOUGLAS SILVA', 'Navegação - N° 21', '2025-08-19', '2S BRAZ', 'Sala limpa'),
('SETOR 4 - S2 DOUGLAS SILVA', 'Inteligência - N° 33/34', '2025-07-16', '2S BRAZ', 'Área em conformidade'),
('SETOR 4 - S2 DOUGLAS SILVA', 'Lixo Sigiloso', '2025-08-19', '2S BRAZ', 'Local organizado');

-- SETOR 5 - S1 NYCOLAS
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 5 - S1 NYCOLAS', 'Vestiário OF - N° 15', '2025-09-01', '2S BRAZ', 'Vestiário limpo'),
('SETOR 5 - S1 NYCOLAS', 'RP - N° 5', '2025-09-01', '2T OBREGON', 'Sala organizada'),
('SETOR 5 - S1 NYCOLAS', 'SOP - N° 25', '2025-09-01', '2S BRAZ', 'Local em conformidade'),
('SETOR 5 - S1 NYCOLAS', 'Sala N° 56', '2025-09-01', '2S BRAZ', 'Sala limpa'),
('SETOR 5 - S1 NYCOLAS', 'Guerra Eletrônica - N° 26', '2025-09-01', '2S BRAZ', 'Área organizada');

-- SETOR 6 - S2 PÍBER
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 6 - S2 PÍBER', 'Vestiário SO/SGT - N° 14', '2025-09-02', '2S BRAZ', 'Vestiário limpo'),
('SETOR 6 - S2 PÍBER', 'SAP - N° 7', '2025-09-02', '3S VILELA', 'Sala organizada'),
('SETOR 6 - S2 PÍBER', 'SIPAA - N° 24', '2025-09-02', '3S ANNE', 'Local em conformidade'),
('SETOR 6 - S2 PÍBER', 'Banheiro Feminino', '2025-09-02', '3S ANNE', 'Banheiro limpo'),
('SETOR 6 - S2 PÍBER', 'CGMASO - N° 28', '2025-09-02', '2S RIBAS', 'Área organizada');

-- SETOR 7 - S2 JOÃO GABRIEL
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 7 - S2 JOÃO GABRIEL', 'Vestiário CB/SD - N° 19', '2025-06-13', '2S BRAZ', 'Necessita nova limpeza'),
('SETOR 7 - S2 JOÃO GABRIEL', 'Ajudância - N° 10', '2025-06-13', '2S BRAZ', 'Sala em bom estado'),
('SETOR 7 - S2 JOÃO GABRIEL', 'Sala Briefing Paus - N° 35', '2025-06-13', '2S BRAZ', 'Local organizado'),
('SETOR 7 - S2 JOÃO GABRIEL', 'Sala N° 61', '2025-06-13', '3S HÖEHR', 'Sala limpa'),
('SETOR 7 - S2 JOÃO GABRIEL', 'Sala N° 58', '2025-06-30', '2S BRAZ', 'Área em conformidade'),
('SETOR 7 - S2 JOÃO GABRIEL', 'Churrasqueira', '2025-06-13', '2S BRAZ', 'Local limpo');

-- SETOR 8 - S2 VIEIRA
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SETOR 8 - S2 VIEIRA', 'Protocolo - N° 9', '2025-06-13', '2S BRAZ', 'Sala organizada'),
('SETOR 8 - S2 VIEIRA', 'Salão Histórico - N° 11', '2025-06-13', '2S BRAZ', 'Local em conformidade'),
('SETOR 8 - S2 VIEIRA', 'Lixo Comum', '2025-07-16', '2S BRAZ', 'Área limpa'),
('SETOR 8 - S2 VIEIRA', 'Escala - N° 27', '2025-08-19', '3S JAQUES', 'Sala organizada'),
('SETOR 8 - S2 VIEIRA', 'Banheiros Auditórios', '2025-06-13', '2S BRAZ', 'Banheiros limpos'),
('SETOR 8 - S2 VIEIRA', 'Aeromédica - N° 6', '2025-06-13', '2S BRAZ', 'Local em conformidade');

-- PERMANÊNCIA
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('PERMANÊNCIA', 'Sala CMT - N° 12', '2025-06-17', '2S BRAZ', 'Sala limpa'),
('PERMANÊNCIA', 'Quarto Permanência - N° 20', '2025-06-17', '2S BRAZ', 'Quarto organizado'),
('PERMANÊNCIA', 'Hall de Entrada', '2025-06-17', '2S BRAZ', 'Hall limpo');

-- SOB DEMANDA
INSERT INTO cleaning_records (sector, location, last_cleaning_date, checked_by, notes) VALUES
('SOB DEMANDA', 'Área externa', '2025-05-14', NULL, 'Pendente limpeza');

-- 7. VERIFICAR ESTRUTURA CRIADA
-- =====================================================
-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cleaning_records'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'cleaning_records'
ORDER BY policyname;

-- Verificar dados inseridos
SELECT 
    sector,
    location,
    last_cleaning_date,
    checked_by,
    created_at
FROM cleaning_records
ORDER BY sector, location;

-- Verificar contagem por setor
SELECT 
    sector,
    COUNT(*) as total_locations,
    COUNT(CASE WHEN checked_by IS NOT NULL THEN 1 END) as locations_checked,
    COUNT(CASE WHEN checked_by IS NULL THEN 1 END) as locations_unchecked
FROM cleaning_records
GROUP BY sector
ORDER BY sector; 