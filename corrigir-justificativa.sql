-- CORRIGIR JUSTIFICATIVA DO TC CARNEIRO
-- Execute este comando no SQL Editor do Supabase

-- 1. Verificar a justificativa atual
SELECT * FROM military_justifications WHERE military_name = 'CARNEIRO';

-- 2. Atualizar a justificativa para incluir o mês atual (Agosto 2025)
UPDATE military_justifications 
SET 
  start_date = '2025-08-01',
  end_date = '2025-08-31'
WHERE military_name = 'CARNEIRO';

-- 3. Verificar se foi atualizada
SELECT * FROM military_justifications WHERE military_name = 'CARNEIRO';

-- 4. Verificar todas as justificativas
SELECT * FROM military_justifications ORDER BY created_at DESC;
