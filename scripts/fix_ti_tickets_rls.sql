-- Script para corrigir as políticas RLS da tabela ti_tickets
-- Problema: Políticas muito restritivas impedindo UPDATE

-- 1. Remover políticas antigas problemáticas
DROP POLICY IF EXISTS "ti_tickets_update_assigned" ON ti_tickets;
DROP POLICY IF EXISTS "ti_tickets_insert_all" ON ti_tickets;
DROP POLICY IF EXISTS "ti_tickets_read_all" ON ti_tickets;

-- 2. Criar novas políticas mais flexíveis
-- Política para leitura: qualquer um pode ler
CREATE POLICY "ti_tickets_read_all" ON ti_tickets 
FOR SELECT USING (true);

-- Política para inserção: qualquer um pode criar tickets
CREATE POLICY "ti_tickets_insert_all" ON ti_tickets 
FOR INSERT WITH CHECK (true);

-- Política para atualização: permitir UPDATE para qualquer usuário autenticado
-- ou para tickets com status básicos
CREATE POLICY "ti_tickets_update_all" ON ti_tickets 
FOR UPDATE USING (
    -- Permitir UPDATE para qualquer usuário autenticado
    auth.role() = 'authenticated' 
    OR 
    -- Ou para tickets com status básicos (sem autenticação)
    status IN ('aberto', 'em_andamento')
);

-- 3. Verificar se as políticas foram criadas
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

-- 4. Testar se as políticas estão funcionando
-- (Execute isso no Supabase SQL Editor para verificar)
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
