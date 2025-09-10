-- =====================================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DA TABELA PROFILES
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Verificar se a tabela profiles existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 2. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela auth.users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 4. Verificar se há dados na tabela profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 5. Verificar se há dados na tabela auth.users
SELECT COUNT(*) as total_users FROM auth.users;

-- 6. Verificar alguns registros de profiles
SELECT 
    id,
    user_id,
    display_name,
    role,
    rank,
    squadron
FROM profiles
LIMIT 5;

-- 7. Verificar alguns registros de auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
LIMIT 5;
