-- VERIFICAR COMO AS DATAS ESTÃO SENDO SALVAS
-- Execute este comando no SQL Editor do Supabase

-- 1. Verificar a estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'military_justifications'
ORDER BY ordinal_position;

-- 2. Verificar todas as justificativas com detalhes das datas
SELECT 
  id,
  military_name,
  reason,
  start_date,
  end_date,
  created_at,
  -- Verificar o tipo de dados
  pg_typeof(start_date) as start_date_type,
  pg_typeof(end_date) as end_date_type
FROM military_justifications
ORDER BY created_at DESC;

-- 3. Verificar se há problemas de timezone
SELECT 
  military_name,
  start_date,
  end_date,
  -- Converter para timestamp para ver se há mudança
  start_date::timestamp as start_timestamp,
  end_date::timestamp as end_timestamp
FROM military_justifications
ORDER BY created_at DESC;
