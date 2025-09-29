-- Script para verificar e corrigir RLS da tabela cancoes
-- Executar no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cancoes';

-- 2. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'cancoes';

-- 3. Desabilitar RLS temporariamente para teste
ALTER TABLE cancoes DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se agora consegue ler os dados
SELECT * FROM cancoes WHERE ativo = true;

-- 5. Reabilitar RLS com política correta
ALTER TABLE cancoes ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários autenticados podem ler canções ativas" ON cancoes;
DROP POLICY IF EXISTS "Apenas admins podem inserir/editar canções" ON cancoes;

-- 7. Criar política simples para leitura
CREATE POLICY "Permitir leitura para usuários autenticados" ON cancoes
    FOR SELECT USING (auth.role() = 'authenticated');

-- 8. Testar novamente
SELECT * FROM cancoes WHERE ativo = true;
