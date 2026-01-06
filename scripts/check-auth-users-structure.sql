-- =====================================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DA TABELA AUTH.USERS
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Verificar estrutura da tabela auth.users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 2. Verificar alguns registros de exemplo
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
LIMIT 3;

-- 3. Verificar se a tabela profiles existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
