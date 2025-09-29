-- =====================================================
-- VERIFICAÇÃO DA ESTRUTURA ATUAL DAS TABELAS
-- Sistema POKER 360
-- =====================================================

-- 1. Verificar se as tabelas existem
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%military%'
ORDER BY table_name;

-- 2. Verificar a estrutura da tabela military_attendance_records (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_attendance_records'
ORDER BY ordinal_position;

-- 3. Verificar a estrutura da tabela military_justifications (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_justifications'
ORDER BY ordinal_position;

-- 4. Verificar a estrutura da tabela military_personnel (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_personnel'
ORDER BY ordinal_position;

-- 5. Verificar todas as tabelas públicas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
