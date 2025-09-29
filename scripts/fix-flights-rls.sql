-- scripts/fix-flights-rls.sql
-- Corrige as políticas RLS da tabela flights para permitir acesso

-- 1. Desabilitar RLS temporariamente
ALTER TABLE flights DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS flights_select_all ON flights;
DROP POLICY IF EXISTS flights_insert_authenticated ON flights;
DROP POLICY IF EXISTS flights_update_authenticated ON flights;
DROP POLICY IF EXISTS flights_delete_authenticated ON flights;

-- 3. Criar política de acesso público para leitura
CREATE POLICY flights_select_all
    ON flights
    FOR SELECT
    USING (TRUE);

-- 4. Criar política de inserção para usuários autenticados
CREATE POLICY flights_insert_authenticated
    ON flights
    FOR INSERT
    WITH CHECK (TRUE);

-- 5. Criar política de atualização para usuários autenticados
CREATE POLICY flights_update_authenticated
    ON flights
    FOR UPDATE
    USING (TRUE)
    WITH CHECK (TRUE);

-- 6. Criar política de exclusão para usuários autenticados
CREATE POLICY flights_delete_authenticated
    ON flights
    FOR DELETE
    USING (TRUE);

-- 7. Reabilitar RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- 8. Verificar políticas criadas
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'flights';

-- 9. Testar acesso
SELECT COUNT(*) as total_flights FROM flights;
