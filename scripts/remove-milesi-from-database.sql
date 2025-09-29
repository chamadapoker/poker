-- Script para remover S2 MILESI de todas as tabelas do sistema
-- Execute este script no Supabase SQL Editor

-- 1. Remover da tabela military_personnel (se existir)
DELETE FROM military_personnel 
WHERE name ILIKE '%MILESI%' OR name ILIKE '%milesi%';

-- 2. Remover da tabela military_attendance_records (se existir)
DELETE FROM military_attendance_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 3. Remover da tabela military_justifications (se existir)
DELETE FROM military_justifications 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 4. Remover da tabela daily_permanence_records (se existir)
DELETE FROM daily_permanence_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 5. Verificar se há outras referências
-- Tabela de chaves (claviculario)
DELETE FROM claviculario_movements 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 6. Log da remoção
INSERT INTO system_logs (action, details, created_at) 
VALUES (
    'REMOVE_MILITARY', 
    'Removido S2 MILESI de todas as tabelas do sistema', 
    NOW()
);

-- 7. Verificar se a remoção foi bem-sucedida
SELECT 'Verificação de remoção do MILESI:' as status;

SELECT 'military_personnel' as tabela, COUNT(*) as registros_restantes
FROM military_personnel 
WHERE name ILIKE '%MILESI%' OR name ILIKE '%milesi%';

SELECT 'military_attendance_records' as tabela, COUNT(*) as registros_restantes
FROM military_attendance_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

SELECT 'military_justifications' as tabela, COUNT(*) as registros_restantes
FROM military_justifications 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

SELECT 'daily_permanence_records' as tabela, COUNT(*) as registros_restantes
FROM daily_permanence_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

SELECT 'claviculario_movements' as tabela, COUNT(*) as registros_restantes
FROM claviculario_movements 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';
