-- =====================================================
-- CORREÇÃO DA TABELA MILITARY_JUSTIFICATIONS
-- Sistema POKER 360
-- =====================================================

-- 1. Verificar se a tabela existe e sua estrutura atual
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'military_justifications';

-- 2. Se a tabela existir, verificar sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_justifications'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_justifications FROM military_justifications;

-- 4. ADICIONAR A COLUNA FALTANTE:
-- EXECUTE ESTE COMANDO PARA ADICIONAR A COLUNA military_name:

ALTER TABLE military_justifications 
ADD COLUMN military_name TEXT NOT NULL DEFAULT '';

-- 5. Se a estrutura estiver incorreta, recriar a tabela:
-- EXECUTE ESTE COMANDO APENAS SE NECESSÁRIO:

/*
-- Remover tabela existente
DROP TABLE IF EXISTS military_justifications CASCADE;

-- Criar tabela com estrutura correta (COM coluna military_name)
CREATE TABLE military_justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id TEXT NOT NULL,
    military_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_military_justifications_military_id ON military_justifications(military_id);
CREATE INDEX idx_military_justifications_date_range ON military_justifications(start_date, end_date);
CREATE INDEX idx_military_justifications_created_at ON military_justifications(created_at);

-- Inserir dados de teste
INSERT INTO military_justifications (military_id, military_name, reason, start_date, end_date) VALUES
('1', 'CARNEIRO', 'Atestado médico - Consulta médica', '2025-01-20', '2025-01-20'),
('2', 'MAIA', 'Serviço externo - Reunião no comando', '2025-01-21', '2025-01-21');
*/

-- 6. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'military_justifications';

-- 7. Verificar políticas RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'military_justifications';

-- 8. Se houver RLS ativo, desativar temporariamente para teste:
/*
ALTER TABLE military_justifications DISABLE ROW LEVEL SECURITY;
*/

-- 9. Verificar se a tabela está acessível:
SELECT * FROM military_justifications LIMIT 5;

-- 10. Verificar a nova estrutura após adicionar a coluna:
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_justifications'
ORDER BY ordinal_position;
