-- REMOVER TABELA DUPLICADA
-- Execute este comando no SQL Editor do Supabase para remover a tabela antiga

-- 1. Verificar se a tabela justifications existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('justifications', 'military_justifications');

-- 2. Verificar o conteúdo da tabela justifications (se existir)
SELECT * FROM justifications LIMIT 5;

-- 3. REMOVER a tabela duplicada justifications (execute apenas se não tiver dados importantes)
DROP TABLE IF EXISTS justifications CASCADE;

-- 4. Verificar se foi removida
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('justifications', 'military_justifications');

-- 5. Verificar se military_justifications ainda existe e tem dados
SELECT COUNT(*) as total_justificativas FROM military_justifications;
SELECT * FROM military_justifications;
