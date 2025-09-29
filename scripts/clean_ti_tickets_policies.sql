-- Script para limpar políticas conflitantes de UPDATE da tabela ti_tickets
-- PROBLEMA: Duas políticas de UPDATE estão conflitando

-- 1. Remover política antiga restritiva
DROP POLICY IF EXISTS "ti_tickets_update_all" ON ti_tickets;

-- 2. Verificar se a política permissiva está funcionando
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
WHERE tablename = 'ti_tickets'
ORDER BY policyname;

-- 3. Testar se agora só existe uma política de UPDATE
-- Deve mostrar apenas 4 políticas: read, insert, update (permissiva), delete
