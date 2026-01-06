-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DA CONSTRAINT DE STATUS
-- Sistema POKER 360
-- =====================================================

-- 1. VERIFICAR SE EXISTE UMA CONSTRAINT DE STATUS
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'military_attendance_records'::regclass 
AND contype = 'c';

-- 2. VERIFICAR A ESTRUTURA ATUAL DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'military_attendance_records'
AND column_name = 'status'
ORDER BY ordinal_position;

-- 3. SE EXISTIR UMA CONSTRAINT PROBLEMÁTICA, REMOVÊ-LA
-- (Execute apenas se necessário)
-- ALTER TABLE military_attendance_records DROP CONSTRAINT IF EXISTS military_attendance_records_status_check;

-- 4. CRIAR UMA NOVA CONSTRAINT CORRETA (Execute após remover a antiga)
-- ALTER TABLE military_attendance_records 
-- ADD CONSTRAINT military_attendance_records_status_check 
-- CHECK (status IN (
--     'presente', 'ausente', 'dispensa', 'entrando-servico', 'formatura', 
--     'gsau', 'horus', 'mercado', 'reuniao', 'saindo-servico', 'tacf', 
--     'voo', 'voo-noturno', 'justificado'
-- ));

-- 5. VERIFICAR OS VALORES ATUAIS NA TABELA
SELECT DISTINCT status, COUNT(*) as quantidade
FROM military_attendance_records 
GROUP BY status
ORDER BY status;

-- 6. VERIFICAR SE A TABELA TEM DADOS
SELECT COUNT(*) as total_registros
FROM military_attendance_records;
