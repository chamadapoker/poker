-- TESTE DE INSERÇÃO NO CLAVICULÁRIO
-- Este script testa se os valores corretos funcionam

-- 1. Verificar constraint atual
SELECT 
    'Constraint atual' as info,
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'claviculario_movements'::regclass
AND conname = 'claviculario_movements_type_check';

-- 2. Testar inserção com valores corretos
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
        RAISE NOTICE 'Testando inserção com RETIRADA...';
        
        -- Testar inserção com RETIRADA
        INSERT INTO claviculario_movements (
            key_id, 
            military_id, 
            type, 
            notes
        ) VALUES (
            test_key_id,
            test_military_id,
            'RETIRADA',
            'Teste de retirada - ' || NOW()
        ) RETURNING * INTO insert_result;
        
        RAISE NOTICE '✅ RETIRADA inserida com sucesso: %', insert_result.id;
        
        -- Testar inserção com DEVOLUCAO
        RAISE NOTICE 'Testando inserção com DEVOLUCAO...';
        
        INSERT INTO claviculario_movements (
            key_id, 
            military_id, 
            type, 
            notes
        ) VALUES (
            test_key_id,
            test_military_id,
            'DEVOLUCAO',
            'Teste de devolução - ' || NOW()
        ) RETURNING * INTO insert_result;
        
        RAISE NOTICE '✅ DEVOLUCAO inserida com sucesso: %', insert_result.id;
        
        -- Limpar registros de teste
        DELETE FROM claviculario_movements WHERE notes LIKE 'Teste de %';
        RAISE NOTICE '🧹 Registros de teste removidos';
        
    ELSE
        RAISE NOTICE '❌ Não foi possível encontrar chave ou militar para teste';
        RAISE NOTICE 'Chaves disponíveis: %', (SELECT COUNT(*) FROM claviculario_keys);
        RAISE NOTICE 'Militares disponíveis: %', (SELECT COUNT(*) FROM military_personnel);
    END IF;
END $$;

-- 3. Verificar se as inserções funcionaram
SELECT 
    'Status final' as info,
    COUNT(*) as total_registros,
    'Teste concluído com sucesso' as resultado
FROM claviculario_movements;

-- 4. Verificar valores únicos em type
SELECT 
    'Valores aceitos' as info,
    type,
    COUNT(*) as quantidade
FROM claviculario_movements 
GROUP BY type;
