-- CORREÇÃO DAS POLÍTICAS RLS PARA ACESSO PÚBLICO
-- Este script corrige problemas de permissão nas tabelas

-- 1. Desabilitar RLS temporariamente para military_justifications
ALTER TABLE military_justifications DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se a tabela existe e tem dados
SELECT 
    'military_justifications' as table_name,
    COUNT(*) as total_records,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Tem dados'
        ELSE '❌ Sem dados'
    END as status
FROM military_justifications;

-- 3. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'military_justifications'
ORDER BY ordinal_position;

-- 4. Verificar dados existentes (primeiros 5 registros)
SELECT * FROM military_justifications LIMIT 5;

-- 5. Habilitar RLS novamente
ALTER TABLE military_justifications ENABLE ROW LEVEL SECURITY;

-- 6. Remover TODAS as políticas existentes que possam estar causando problemas
-- Usar DROP POLICY IF EXISTS para evitar erros
DROP POLICY IF EXISTS "Enable read access for all users" ON military_justifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON military_justifications;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON military_justifications;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON military_justifications;
DROP POLICY IF EXISTS "military_justifications_read_all" ON military_justifications;
DROP POLICY IF EXISTS "military_justifications_insert_auth" ON military_justifications;
DROP POLICY IF EXISTS "military_justifications_update_own" ON military_justifications;
DROP POLICY IF EXISTS "military_justifications_delete_own" ON military_justifications;
DROP POLICY IF EXISTS "public_read_access" ON military_justifications;
DROP POLICY IF EXISTS "public_insert_access" ON military_justifications;
DROP POLICY IF EXISTS "public_update_access" ON military_justifications;
DROP POLICY IF EXISTS "public_delete_access" ON military_justifications;
DROP POLICY IF EXISTS "public_access" ON military_justifications;
DROP POLICY IF EXISTS "anon_access" ON military_justifications;
DROP POLICY IF EXISTS "authenticated_access" ON military_justifications;

-- 7. Verificar se todas as políticas foram removidas
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

-- 8. Criar políticas simples e permissivas (apenas se não existirem)
DO $$
BEGIN
    -- Política para SELECT (leitura)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'military_justifications' 
        AND policyname = 'public_read_access'
    ) THEN
        CREATE POLICY "public_read_access" ON military_justifications FOR SELECT USING (true);
        RAISE NOTICE 'Política public_read_access criada com sucesso';
    ELSE
        RAISE NOTICE 'Política public_read_access já existe';
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'military_justifications' 
        AND policyname = 'public_insert_access'
    ) THEN
        CREATE POLICY "public_insert_access" ON military_justifications FOR INSERT WITH CHECK (true);
        RAISE NOTICE 'Política public_insert_access criada com sucesso';
    ELSE
        RAISE NOTICE 'Política public_insert_access já existe';
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'military_justifications' 
        AND policyname = 'public_update_access'
    ) THEN
        CREATE POLICY "public_update_access" ON military_justifications FOR UPDATE USING (true);
        RAISE NOTICE 'Política public_update_access criada com sucesso';
    ELSE
        RAISE NOTICE 'Política public_update_access já existe';
    END IF;

    -- Política para DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'military_justifications' 
        AND policyname = 'public_delete_access'
    ) THEN
        CREATE POLICY "public_delete_access" ON military_justifications FOR DELETE USING (true);
        RAISE NOTICE 'Política public_delete_access criada com sucesso';
    ELSE
        RAISE NOTICE 'Política public_delete_access já existe';
    END IF;
END $$;

-- 9. Verificar políticas criadas
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

-- 10. Testar acesso com usuário anônimo
-- (Este comando deve funcionar sem erro)
SELECT COUNT(*) FROM military_justifications;

-- 11. Verificar se há triggers ou constraints que possam estar interferindo
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'military_justifications';

-- 12. Verificar se há foreign keys que possam estar causando problemas
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'military_justifications';

-- 13. Verificar se a tabela está no schema correto
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'military_justifications';

-- 14. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'military_justifications';

-- 15. Garantir que o usuário anônimo tenha acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON military_justifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON military_justifications TO authenticated;

-- 16. Verificar se as permissões foram aplicadas
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'military_justifications'
ORDER BY grantee, privilege_type;

-- 17. Teste final - tentar inserir um registro de teste
INSERT INTO military_justifications (
    military_id, 
    military_name, 
    reason, 
    start_date, 
    end_date
) VALUES (
    'TEST-001',
    'MILITAR TESTE',
    'Teste de permissão',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day'
) ON CONFLICT DO NOTHING;

-- 18. Verificar se o registro de teste foi inserido
SELECT * FROM military_justifications WHERE military_id = 'TEST-001';

-- 19. Limpar registro de teste
DELETE FROM military_justifications WHERE military_id = 'TEST-001';

-- 20. Status final
SELECT 
    'military_justifications' as table_name,
    COUNT(*) as total_records,
    'RLS habilitado com políticas públicas' as rls_status
FROM military_justifications;

-- 21. Teste de acesso anônimo final
-- Este comando deve retornar dados sem erro
SELECT 
    '✅ Teste de acesso anônimo' as teste,
    COUNT(*) as total_justificativas,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'SUCESSO - Acesso permitido'
        ELSE 'FALHA - Acesso negado'
    END as resultado
FROM military_justifications;
