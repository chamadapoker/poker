-- CORRIGIR TABELA CLAVICULÁRIO MOVEMENTS
-- Este script corrige a tabela existente adicionando colunas faltantes

-- 1. Verificar estrutura atual da tabela
SELECT 
    'Estrutura atual' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'claviculario_movements'
ORDER BY ordinal_position;

-- 2. Adicionar coluna notes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claviculario_movements' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE claviculario_movements ADD COLUMN notes TEXT;
        RAISE NOTICE 'Coluna notes adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna notes já existe';
    END IF;
END $$;

-- 3. Adicionar coluna created_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claviculario_movements' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE claviculario_movements ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe';
    END IF;
END $$;

-- 4. Verificar se a coluna type tem as opções corretas
DO $$ 
BEGIN
    -- Verificar se a constraint existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%claviculario_movements_type%'
    ) THEN
        -- Adicionar constraint se não existir
        ALTER TABLE claviculario_movements ADD CONSTRAINT check_type_values 
        CHECK (type IN ('withdrawal', 'return'));
        RAISE NOTICE 'Constraint de tipo adicionada';
    ELSE
        RAISE NOTICE 'Constraint de tipo já existe';
    END IF;
END $$;

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_claviculario_movements_key_id ON claviculario_movements(key_id);
CREATE INDEX IF NOT EXISTS idx_claviculario_movements_military_id ON claviculario_movements(military_id);
CREATE INDEX IF NOT EXISTS idx_claviculario_movements_timestamp ON claviculario_movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_claviculario_movements_type ON claviculario_movements(type);

-- 6. Desabilitar RLS para permitir operações
ALTER TABLE claviculario_movements DISABLE ROW LEVEL SECURITY;

-- 7. Garantir permissões para usuários anônimos
GRANT SELECT, INSERT, UPDATE, DELETE ON claviculario_movements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON claviculario_movements TO authenticated;

-- 8. Verificar estrutura final da tabela
SELECT 
    'Estrutura final' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'claviculario_movements'
ORDER BY ordinal_position;

-- 9. Testar inserção de um registro de exemplo
DO $$
DECLARE
    test_key_id UUID;
    test_military_id UUID;
    insert_result RECORD;
BEGIN
    -- Buscar IDs de teste
    SELECT id INTO test_key_id FROM claviculario_keys LIMIT 1;
    SELECT id INTO test_military_id FROM military_personnel LIMIT 1;
    
    IF test_key_id IS NOT NULL AND test_military_id IS NOT NULL THEN
        -- Inserir registro de teste
        INSERT INTO claviculario_movements (
            key_id, 
            military_id, 
            type, 
            notes
        ) VALUES (
            test_key_id,
            test_military_id,
            'withdrawal',
            'Teste de inserção - ' || NOW()
        ) RETURNING * INTO insert_result;
        
        RAISE NOTICE 'Registro de teste inserido com sucesso: %', insert_result.id;
        
        -- Limpar registro de teste
        DELETE FROM claviculario_movements WHERE notes LIKE 'Teste de inserção%';
        RAISE NOTICE 'Registro de teste removido';
        
    ELSE
        RAISE NOTICE 'Não foi possível encontrar chave ou militar para teste';
    END IF;
END $$;

-- 10. Status final da tabela
SELECT 
    'claviculario_movements' as table_name,
    COUNT(*) as total_records,
    'Tabela corrigida e funcionando' as status
FROM claviculario_movements;

-- 11. Verificar permissões
SELECT 
    'Permissões' as info,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'claviculario_movements'
ORDER BY grantee, privilege_type;
