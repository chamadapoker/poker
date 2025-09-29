-- ADICIONAR CAMPOS MILITARES À TABELA CLAVICULÁRIO MOVEMENTS
-- Este script adiciona os campos military_name e military_rank para facilitar a exibição

-- 1. Verificar estrutura atual da tabela
SELECT 
    'Estrutura atual' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'claviculario_movements'
ORDER BY ordinal_position;

-- 2. Adicionar coluna military_name se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claviculario_movements' 
        AND column_name = 'military_name'
    ) THEN
        ALTER TABLE claviculario_movements ADD COLUMN military_name TEXT;
        RAISE NOTICE 'Coluna military_name adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna military_name já existe';
    END IF;
END $$;

-- 3. Adicionar coluna military_rank se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claviculario_movements' 
        AND column_name = 'military_rank'
    ) THEN
        ALTER TABLE claviculario_movements ADD COLUMN military_rank TEXT;
        RAISE NOTICE 'Coluna military_rank adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna military_rank já existe';
    END IF;
END $$;

-- 4. Atualizar registros existentes com dados dos militares
UPDATE claviculario_movements 
SET 
    military_name = mp.name,
    military_rank = mp.rank
FROM military_personnel mp
WHERE claviculario_movements.military_id = mp.id
AND (claviculario_movements.military_name IS NULL OR claviculario_movements.military_rank IS NULL);

-- 5. Verificar quantos registros foram atualizados
SELECT 
    'Registros atualizados' as info,
    COUNT(*) as total_atualizados
FROM claviculario_movements 
WHERE military_name IS NOT NULL AND military_rank IS NOT NULL;

-- 6. Verificar estrutura final da tabela
SELECT 
    'Estrutura final' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'claviculario_movements'
ORDER BY ordinal_position;

-- 7. Mostrar alguns registros de exemplo
SELECT 
    'Exemplo de registros' as info,
    id,
    key_id,
    military_id,
    military_name,
    military_rank,
    type,
    timestamp
FROM claviculario_movements 
LIMIT 5;

-- 8. Criar trigger para atualizar automaticamente os campos militares
CREATE OR REPLACE FUNCTION update_military_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Se military_id foi alterado, atualizar military_name e military_rank
    IF NEW.military_id IS DISTINCT FROM OLD.military_id THEN
        IF NEW.military_id IS NOT NULL THEN
            SELECT name, rank INTO NEW.military_name, NEW.military_rank
            FROM military_personnel 
            WHERE id = NEW.military_id;
        ELSE
            NEW.military_name := NULL;
            NEW.military_rank := NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Aplicar o trigger
DROP TRIGGER IF EXISTS trigger_update_military_info ON claviculario_movements;
CREATE TRIGGER trigger_update_military_info
    BEFORE INSERT OR UPDATE ON claviculario_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_military_info();

-- 10. Testar o trigger com um registro de exemplo
DO $$
DECLARE
    test_key_id UUID;
    test_military_id UUID;
BEGIN
    -- Buscar IDs de teste
    SELECT id INTO test_key_id FROM claviculario_keys LIMIT 1;
    SELECT id INTO test_military_id FROM military_personnel LIMIT 1;
    
    IF test_key_id IS NOT NULL AND test_military_id IS NOT NULL THEN
        -- Inserir registro de teste para verificar o trigger
        INSERT INTO claviculario_movements (
            key_id, 
            military_id, 
            type, 
            notes
        ) VALUES (
            test_key_id,
            test_military_id,
            'withdrawal',
            'Teste do trigger - campos militares preenchidos automaticamente'
        );
        
        RAISE NOTICE 'Registro de teste inserido com sucesso';
    ELSE
        RAISE NOTICE 'Não foi possível encontrar IDs de teste';
    END IF;
END $$;

-- 11. Verificar se o trigger funcionou
SELECT 
    'Teste do trigger' as info,
    id,
    military_id,
    military_name,
    military_rank,
    notes
FROM claviculario_movements 
WHERE notes LIKE 'Teste do trigger%';

-- 12. Limpar registro de teste
DELETE FROM claviculario_movements WHERE notes LIKE 'Teste do trigger%';

-- 13. Status final
SELECT 
    'claviculario_movements' as table_name,
    COUNT(*) as total_records,
    'Campos militares adicionados com sucesso' as status
FROM claviculario_movements;
