-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DA TABELA MILITARY_JUSTIFICATIONS
-- Sistema POKER 360
-- =====================================================

-- 1. Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_justifications'
ORDER BY ordinal_position;

-- 2. Verificar se existem dados na tabela
SELECT COUNT(*) as total_justifications FROM military_justifications;

-- 3. Verificar os últimos registros inseridos
SELECT * FROM military_justifications ORDER BY created_at DESC LIMIT 5;

-- 4. Se a tabela não existir ou estiver incorreta, executar este comando:
-- DROP TABLE IF EXISTS military_justifications CASCADE;

-- 5. Criar a tabela com a estrutura correta (se necessário):
/*
CREATE TABLE military_justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id TEXT NOT NULL,
    military_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 6. Inserir dados de teste (se necessário):
/*
INSERT INTO military_justifications (military_id, military_name, reason, start_date, end_date, approved) VALUES
('1', 'TC CARNEIRO', 'Atestado médico - Consulta médica', '2025-01-20', '2025-01-20', true),
('2', 'MJ MAIA', 'Serviço externo - Reunião no comando', '2025-01-21', '2025-01-21', false);
*/
